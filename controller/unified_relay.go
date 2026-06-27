package controller

import (
	"bytes"
	"encoding/json"
	"io"

	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

// UnifiedRelay 统一入口，根据请求头和请求体自动检测 API 格式
// 支持 OpenAI、Claude、Gemini 三种格式的自动识别
func UnifiedRelay(c *gin.Context) {
	// 读取请求体用于格式检测
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		_ = c.Error(err)
		return
	}

	// 恢复请求体供后续处理器使用
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	// 检测格式
	format := detectRelayFormat(c, body)

	// 调用对应的 Relay 处理器
	Relay(c, format)
}

// detectRelayFormat 根据请求头和请求体结构检测 API 格式
// 优先级：请求头 > 请求体结构 > 默认 OpenAI
func detectRelayFormat(c *gin.Context, body []byte) types.RelayFormat {
	// 优先级 1：请求头检测（最可靠）
	if c.GetHeader("anthropic-version") != "" {
		return types.RelayFormatClaude
	}
	if c.GetHeader("x-goog-api-key") != "" {
		return types.RelayFormatGemini
	}

	// 优先级 2：请求体结构检测
	var m map[string]json.RawMessage
	if err := json.Unmarshal(body, &m); err == nil {
		// Gemini 使用 "contents" 字段而非 "messages"
		if _, hasContents := m["contents"]; hasContents {
			if _, hasMessages := m["messages"]; !hasMessages {
				return types.RelayFormatGemini
			}
		}
	}

	// 默认 OpenAI 格式
	return types.RelayFormatOpenAI
}
