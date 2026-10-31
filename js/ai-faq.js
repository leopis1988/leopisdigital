document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");
  const messages = document.getElementById("aiMessages");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    appendMsg(q, "user");
    input.value = "";

    const typing = appendMsg("…", "bot");

    let answer;
    if (STORE_CONFIG.aiApiUrl && STORE_CONFIG.aiApiKey) {
      answer = await askExternalAI(q);
    } else {
      answer = ruleBasedAnswer(q);
    }

    typing.remove();
    appendMsg(answer, "bot");
  });

  function appendMsg(text, role) {
    const div = document.createElement("div");
    div.className = `ai-msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }
});

function ruleBasedAnswer(q) {
  const lower = q.toLowerCase();

  if (/(delivery|deliver|shipping|island)/.test(lower))
    return "🚚 We deliver island‑wide within 2–5 working days. Free delivery on orders over $50!";

  if (/(order|buy|purchase|whatsapp)/.test(lower))
    return "🛒 Simply add products to your cart and tap “Order via WhatsApp”. Your cart details are pre‑filled – just hit send!";

  if (/(payment|pay|cash|bank)/.test(lower))
    return "💳 We accept cash on delivery and bank transfer. Payment details are confirmed on WhatsApp.";

  if (/(track|tracking|status)/.test(lower))
    return "📦 After confirming your order on WhatsApp, you’ll receive a tracking link or SMS update.";

  if (/(return|refund|exchange)/.test(lower))
    return "🔄 We offer a 7‑day return policy for damaged items. Contact us on WhatsApp with photos.";

  if (/(contact|phone|email|reach)/.test(lower))
    return `📞 Reach us on WhatsApp at +${STORE_CONFIG.whatsappNumber} or email ${STORE_CONFIG.email}.`;

  if (/(price|cost|how much)/.test(lower))
    return "💰 Prices are shown on each product card. For bulk orders, message us on WhatsApp for a custom quote.";

  if (/(stock|available)/.test(lower))
    return "✅ Availability is updated live. If an item is out of stock, message us – we may restock soon!";

  return "🤖 I’m not sure about that one. Try asking about delivery, ordering, payment, or returns – or message us on WhatsApp for a quick reply!";
}

async function askExternalAI(question) {
  try {
    const res = await fetch(STORE_CONFIG.aiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${STORE_CONFIG.aiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful e‑commerce assistant for LeoPis Digital. Answer briefly and accurately about delivery, ordering, payment, and products." },
          { role: "user", content: question }
        ]
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || ruleBasedAnswer(question);
  } catch (e) {
    return ruleBasedAnswer(question);
  }
}
