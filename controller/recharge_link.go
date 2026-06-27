package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// GetRechargeLinks 获取所有充值链接配置（管理员）
func GetRechargeLinks(c *gin.Context) {
	links, err := model.GetAllRechargeLinks()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    links,
	})
}

// GetEnabledRechargeLinks 获取所有启用的充值链接配置（用户）
func GetEnabledRechargeLinks(c *gin.Context) {
	links, err := model.GetEnabledRechargeLinks()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    links,
	})
}

// CreateRechargeLink 创建新的充值链接配置
func CreateRechargeLink(c *gin.Context) {
	var link model.RechargeLink
	if err := common.DecodeJson(c.Request.Body, &link); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的请求参数",
		})
		return
	}

	if link.Amount <= 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "充值金额必须大于0",
		})
		return
	}

	if link.AmountLabel == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请填写显示标签",
		})
		return
	}

	if err := link.Insert(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "创建成功",
		"data":    link,
	})
}

// UpdateRechargeLink 更新充值链接配置
func UpdateRechargeLink(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
		})
		return
	}

	existingLink, err := model.GetRechargeLinkById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "充值链接不存在",
		})
		return
	}

	var link model.RechargeLink
	if err := common.DecodeJson(c.Request.Body, &link); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的请求参数",
		})
		return
	}

	// 更新字段
	if link.Amount > 0 {
		existingLink.Amount = link.Amount
	}
	if link.AmountLabel != "" {
		existingLink.AmountLabel = link.AmountLabel
	}
	existingLink.Link = link.Link
	existingLink.SortOrder = link.SortOrder
	existingLink.Enabled = link.Enabled

	if err := existingLink.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新成功",
		"data":    existingLink,
	})
}

// DeleteRechargeLink 删除充值链接配置
func DeleteRechargeLink(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
		})
		return
	}

	if err := model.DeleteRechargeLinkById(id); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}

// BatchUpdateRechargeLinks 批量更新充值链接配置
func BatchUpdateRechargeLinks(c *gin.Context) {
	var links []*model.RechargeLink
	if err := common.DecodeJson(c.Request.Body, &links); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的请求参数",
		})
		return
	}

	if err := model.BatchUpdateRechargeLinks(links); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "批量更新成功",
	})
}
