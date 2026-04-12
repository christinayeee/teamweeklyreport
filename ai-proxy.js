exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.BIGMODEL_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '未配置 BIGMODEL_API_KEY 环境变量' })
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',   // 速度快、免费额度多；如需更高质量换 glm-4-plus
        messages,
        temperature: 0.3        // 低温确保 JSON 格式稳定
      })
    });

    const data = await response.json();

    // 统一成前端期望的格式：{ content: [{ text: "..." }] }
    const text = data.choices?.[0]?.message?.content ?? '';
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ text }] })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
