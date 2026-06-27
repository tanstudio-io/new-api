package controller

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

func TestDetectRelayFormat(t *testing.T) {
	tests := []struct {
		name     string
		headers  map[string]string
		body     string
		expected types.RelayFormat
	}{
		// 请求头检测
		{
			name: "Claude: anthropic-version 头",
			headers: map[string]string{
				"anthropic-version": "2023-06-01",
				"x-api-key":         "sk-test",
			},
			body:     `{"model":"claude-3-opus","messages":[{"role":"user","content":"hello"}],"max_tokens":1024}`,
			expected: types.RelayFormatClaude,
		},
		{
			name: "Gemini: x-goog-api-key 头",
			headers: map[string]string{
				"x-goog-api-key": "sk-test",
			},
			body:     `{"contents":[{"parts":[{"text":"hello"}]}]}`,
			expected: types.RelayFormatGemini,
		},
		{
			name: "OpenAI: Authorization 头",
			headers: map[string]string{
				"Authorization": "Bearer sk-test",
			},
			body:     `{"model":"gpt-4","messages":[{"role":"user","content":"hello"}]}`,
			expected: types.RelayFormatOpenAI,
		},
		// 请求体结构检测
		{
			name: "Gemini: 请求体有 contents 无 messages",
			headers: map[string]string{
				"Authorization": "Bearer sk-test",
			},
			body:     `{"contents":[{"parts":[{"text":"hello"}]}]}`,
			expected: types.RelayFormatGemini,
		},
		{
			name: "OpenAI: 请求体有 messages",
			headers: map[string]string{
				"Authorization": "Bearer sk-test",
			},
			body:     `{"model":"gpt-4","messages":[{"role":"user","content":"hello"}]}`,
			expected: types.RelayFormatOpenAI,
		},
		{
			name: "Claude: 请求体有 messages 和 max_tokens",
			headers: map[string]string{
				"Authorization": "Bearer sk-test",
			},
			body:     `{"model":"claude-3-opus","messages":[{"role":"user","content":"hello"}],"max_tokens":1024}`,
			expected: types.RelayFormatOpenAI, // 没有 anthropic-version 头，所以默认 OpenAI
		},
		// 边界情况
		{
			name:     "无头信息，默认 OpenAI",
			headers:  map[string]string{},
			body:     `{"model":"gpt-4","messages":[{"role":"user","content":"hello"}]}`,
			expected: types.RelayFormatOpenAI,
		},
		{
			name: "同时有 anthropic-version 和 x-goog-api-key，优先 Claude",
			headers: map[string]string{
				"anthropic-version": "2023-06-01",
				"x-goog-api-key":   "sk-test",
			},
			body:     `{"model":"claude-3-opus","messages":[]}`,
			expected: types.RelayFormatClaude,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 创建测试请求
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			req := httptest.NewRequest("POST", "/v1/auto", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")

			// 设置请求头
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}

			c.Request = req

			// 读取请求体
			body := []byte(tt.body)

			// 调用检测函数
			result := detectRelayFormat(c, body)

			// 验证结果
			if result != tt.expected {
				t.Errorf("期望 %s，实际 %s", tt.expected, result)
			} else {
				t.Logf("✅ 通过: %s -> %s", tt.name, result)
			}
		})
	}
}
