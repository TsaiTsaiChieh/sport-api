// 討論區文章
exports.createTopicAllowed = {
  allowedTags: ['br', 'b', 'i', 'u', 'a', 'img', 'strike', 'div', 'span', 'font', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  allowedAttributes: {
    div: ['style'],
    li: ['style'],
    span: ['style'],
    strike: ['style'],
    b: ['style'],
    a: ['href'],
    img: ['src', 'alt'],
    font: ['size', 'color'] // h1~h6
  },
  allowedSchemes: ['http', 'https'],
  allowedSchemesAppliedToAttributes: ['href', 'src', 'style'],
  allowedStyles: {
    '*': {
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'text-align': [/^left$/, /^right$/, /^center$/],
      'font-size': [/^\d+(?:px|em|%)$/]
    }
  }
};

// 回覆文章
exports.replyTopicAllowed = {
  allowedTags: ['br', 'a'],
  allowedAttributes: {
    a: ['href']
  },
  allowedSchemes: ['http', 'https']
};
