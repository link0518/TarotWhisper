'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [isLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // 从 localStorage 加载现有设置
    const savedBaseUrl = localStorage.getItem('tarot_api_base_url')
    const savedApiKey = localStorage.getItem('tarot_api_key')
    const savedModel = localStorage.getItem('tarot_api_model')
    
    if (savedBaseUrl) setBaseUrl(savedBaseUrl)
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
  }, [])

  const handleSave = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) {
      setMessage('请填写完整的 API 配置信息')
      return
    }

    setSaveLoading(true)
    setMessage('')

    try {
      // 保存到 localStorage
      localStorage.setItem('tarot_api_base_url', baseUrl.trim())
      localStorage.setItem('tarot_api_key', apiKey.trim())
      localStorage.setItem('tarot_api_model', model.trim())
      
      setMessage('设置已保存成功！')
      
      // 2秒后跳转到主页
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch {
      setMessage('保存设置时出现错误，请重试')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) {
      setMessage('请先填写完整的 API 配置信息')
      return
    }

    setSaveLoading(true)
    setMessage('正在测试连接...')

    try {
      const response = await fetch(`${baseUrl.trim()}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage('✅ API 连接测试成功！')
      } else {
        setMessage('❌ API 连接测试失败，请检查配置')
      }
    } catch {
      setMessage('❌ 连接测试失败，请检查网络和配置')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-2">API 设置</h1>
            <p className="text-gray-300 mb-8">配置您的 OpenAI 兼容 API 以开始塔罗占卜</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-200 mb-2">
                  API Base URL
                </label>
                <input
                  type="url"
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  例如：https://api.openai.com/v1 或其他兼容端点
                </p>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-200 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  您的 API 密钥，以 sk- 开头
                </p>
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-2">
                  模型名称
                </label>
                <input
                  type="text"
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  要使用的模型名称，如 gpt-4o-mini, gpt-4, claude-3-sonnet 等
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('成功') || message.includes('✅') 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : message.includes('❌') || message.includes('错误') || message.includes('失败')
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isLoading ? '测试中...' : '测试连接'}
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isLoading ? '保存中...' : '保存设置'}
                </button>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-yellow-300 font-medium mb-2">🔒 安全提示</h3>
                <p className="text-yellow-200 text-sm">
                  您的 API 密钥仅保存在本地浏览器中，不会上传到任何服务器。
                  请勿在公共电脑上使用，并定期更换您的 API 密钥以确保安全。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
