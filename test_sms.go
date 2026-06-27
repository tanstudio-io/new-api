package main

import (
	"fmt"
	"os/exec"
	"strings"

	dysmsapi "github.com/alibabacloud-go/dypnsapi-20170525/v3/client"
	openapiutil "github.com/alibabacloud-go/darabonba-openapi/v2/utils"
	"github.com/alibabacloud-go/tea/tea"
)

func main() {
	accessKeyId := getWindowsEnv("accessKeyId")
	accessKeySecret := getWindowsEnv("accessKeySecret")

	fmt.Printf("AccessKeyId: %s...\n", accessKeyId[:8])

	// 创建客户端配置
	config := &openapiutil.Config{
		AccessKeyId:     tea.String(accessKeyId),
		AccessKeySecret: tea.String(accessKeySecret),
		Endpoint:        tea.String("dypnsapi.aliyuncs.com"),
	}

	// 创建客户端
	client, err := dysmsapi.NewClient(config)
	if err != nil {
		fmt.Printf("创建客户端失败: %v\n", err)
		return
	}

	// 发送短信
	sendReq := &dysmsapi.SendSmsVerifyCodeRequest{
		PhoneNumber: tea.String("18133936168"),
		SignName:    tea.String("正切工作室"),
		CodeLength:  tea.Int64(6),
		CountryCode: tea.String("86"),
	}

	fmt.Println("正在发送短信...")
	resp, err := client.SendSmsVerifyCode(sendReq)
	if err != nil {
		fmt.Printf("发送失败: %v\n", err)
		return
	}

	fmt.Printf("RequestId: %s\n", tea.StringValue(resp.Body.RequestId))
	fmt.Printf("Code: %s\n", tea.StringValue(resp.Body.Code))
	fmt.Printf("Message: %s\n", tea.StringValue(resp.Body.Message))

	if tea.StringValue(resp.Body.Code) == "OK" {
		fmt.Println("✅ 短信发送成功！")
	}
}

func getWindowsEnv(key string) string {
	cmd := fmt.Sprintf(`[System.Environment]::GetEnvironmentVariable('%s', 'User')`, key)
	out, err := exec.Command("powershell", "-Command", cmd).Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}
