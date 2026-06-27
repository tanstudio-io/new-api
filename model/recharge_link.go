package model

import (
	"errors"

	"gorm.io/gorm"
)

// RechargeLink 存储充值链接配置
type RechargeLink struct {
	Id          int    `json:"id"`
	Amount      int    `json:"amount" gorm:"uniqueIndex"` // 充值金额（分），如 100 代表 1 元
	AmountLabel string `json:"amount_label" gorm:"type:varchar(50)"` // 显示标签，如 "1￥"
	Link        string `json:"link" gorm:"type:text"` // 充值链接 URL
	SortOrder   int    `json:"sort_order" gorm:"default:0"` // 排序顺序
	Enabled     bool   `json:"enabled" gorm:"default:true"` // 是否启用
	CreatedAt   int64  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

// GetAllRechargeLinks 获取所有充值链接配置
func GetAllRechargeLinks() ([]*RechargeLink, error) {
	var links []*RechargeLink
	err := DB.Order("sort_order ASC, amount ASC").Find(&links).Error
	return links, err
}

// GetEnabledRechargeLinks 获取所有启用的充值链接配置
func GetEnabledRechargeLinks() ([]*RechargeLink, error) {
	var links []*RechargeLink
	err := DB.Where("enabled = ?", true).Order("sort_order ASC, amount ASC").Find(&links).Error
	return links, err
}

// GetRechargeLinkById 根据 ID 获取充值链接
func GetRechargeLinkById(id int) (*RechargeLink, error) {
	if id == 0 {
		return nil, errors.New("无效的 ID")
	}
	link := &RechargeLink{}
	err := DB.Where("id = ?", id).First(link).Error
	return link, err
}

// GetRechargeLinkByAmount 根据金额获取充值链接
func GetRechargeLinkByAmount(amount int) (*RechargeLink, error) {
	if amount <= 0 {
		return nil, errors.New("无效的金额")
	}
	link := &RechargeLink{}
	err := DB.Where("amount = ? AND enabled = ?", amount, true).First(link).Error
	return link, err
}

// Insert 插入新的充值链接配置
func (link *RechargeLink) Insert() error {
	return DB.Create(link).Error
}

// Update 更新充值链接配置
func (link *RechargeLink) Update() error {
	return DB.Save(link).Error
}

// Delete 删除充值链接配置
func (link *RechargeLink) Delete() error {
	return DB.Delete(link).Error
}

// DeleteRechargeLinkById 根据 ID 删除充值链接
func DeleteRechargeLinkById(id int) error {
	if id == 0 {
		return errors.New("无效的 ID")
	}
	return DB.Delete(&RechargeLink{}, id).Error
}

// InitDefaultRechargeLinks 初始化默认的充值链接配置
func InitDefaultRechargeLinks() error {
	// 检查是否已有配置
	var count int64
	DB.Model(&RechargeLink{}).Count(&count)
	if count > 0 {
		return nil
	}

	// 默认充值金额配置（单位：分）
	defaultLinks := []*RechargeLink{
		{Amount: 100, AmountLabel: "1￥", Link: "", SortOrder: 1, Enabled: true},
		{Amount: 500, AmountLabel: "5￥", Link: "", SortOrder: 2, Enabled: true},
		{Amount: 1000, AmountLabel: "10￥", Link: "", SortOrder: 3, Enabled: true},
		{Amount: 2000, AmountLabel: "20￥", Link: "", SortOrder: 4, Enabled: true},
		{Amount: 5000, AmountLabel: "50￥", Link: "", SortOrder: 5, Enabled: true},
		{Amount: 10000, AmountLabel: "100￥", Link: "", SortOrder: 6, Enabled: true},
		{Amount: 20000, AmountLabel: "200￥", Link: "", SortOrder: 7, Enabled: true},
	}

	// 批量插入
	return DB.Create(&defaultLinks).Error
}

// BatchUpdateRechargeLinks 批量更新充值链接
func BatchUpdateRechargeLinks(links []*RechargeLink) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		for _, link := range links {
			if link.Id == 0 {
				// 新增
				if err := tx.Create(link).Error; err != nil {
					return err
				}
			} else {
				// 更新
				if err := tx.Save(link).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}
