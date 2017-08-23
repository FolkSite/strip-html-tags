/* eslint no-useless-escape: "off" */
/* eslint no-cond-assign: "off" */

const STATE_PLAINTEXT = Symbol('plaintext')
const STATE_HTML = Symbol('html')
const STATE_COMMENT = Symbol('comment')

const ALLOWED_TAGS_REGEX = /<(\w*)>/g
const NORMALIZE_TAG_REGEX = /<\/?([^\s\/>]+)/

const normalizeTag = (tagBuffer) => {
  const match = NORMALIZE_TAG_REGEX.exec(tagBuffer)
  return match ? match[1].toLowerCase() : null
}

const parseAllowableTags = (allowableTags) => {
  let tagsArray = []
  if (typeof allowableTags === 'string') {
    let match
    while ((match = ALLOWED_TAGS_REGEX.exec(allowableTags)) !== null) {
      tagsArray.push(match[1])
    }
  } else if (typeof allowableTags[Symbol.iterator] === 'function') {
    tagsArray = allowableTags
  }
  return new Set(tagsArray)
}

const initContext = (_allowableTags, tagReplacement) => {
  const allowableTags = parseAllowableTags(_allowableTags)
  return {
    allowableTags,
    tagReplacement,
    state: STATE_PLAINTEXT,
    tagBuffer: '',
    depth: 0,
    inQuoteChar: ''
  }
}

const striptagsInternal = (html, context) => {
  const allowableTags = context.allowableTags
  const tagReplacement = context.tagReplacement
  let state = context.state
  let tagBuffer = context.tagBuffer
  let depth = context.depth
  let inQuoteChar = context.inQuoteChar
  let output = ''

  for (let idx = 0, length = html.length; idx < length; idx += 1) {
    const char = html[idx]
    if (state === STATE_PLAINTEXT) {
      switch (char) {
        case '<':
          state = STATE_HTML
          tagBuffer += char
          break
        default:
          output += char
          break
      }
    } else if (state === STATE_HTML) {
      switch (char) {
        case '<':
          // ignore '<' if inside a quote
          if (inQuoteChar) {
            break
          }
          // we're seeing a nested '<'
          depth += 1
          break
        case '>':
          // ignore '>' if inside a quote
          if (inQuoteChar) {
            break
          }
          // something like this is happening: '<<>>'
          if (depth) {
            depth -= 1
            break
          }
          // this is closing the tag in tagBuffer
          inQuoteChar = ''
          state = STATE_PLAINTEXT
          tagBuffer += '>'
          if (allowableTags.has(normalizeTag(tagBuffer))) {
            output += tagBuffer
          } else {
            output += tagReplacement
          }
          tagBuffer = ''
          break
        case '"':
        case '\'':
          // catch both single and double quotes
          if (char === inQuoteChar) {
            inQuoteChar = ''
          } else {
            inQuoteChar = inQuoteChar || char
          }
          tagBuffer += char
          break
        case '-':
          if (tagBuffer === '<!-') {
            state = STATE_COMMENT
          }
          tagBuffer += char
          break
        case ' ':
        case '\n':
          if (tagBuffer === '<') {
            state = STATE_PLAINTEXT
            output += '< '
            tagBuffer = ''
            break
          }
          tagBuffer += char
          break
        default:
          tagBuffer += char
          break
      }
    } else if (state === STATE_COMMENT) {
      switch (char) {
        case '>':
          if (tagBuffer.slice(-2) === '--') {
            // close the comment
            state = STATE_PLAINTEXT
          }
          tagBuffer = ''
          break
        default:
          tagBuffer += char
          break
      }
    }
  }

  // save the context for future iterations
  context.state = state
  context.tagBuffer = tagBuffer
  context.depth = depth
  context.inQuoteChar = inQuoteChar
  return output
}

const initStriptagsStream = (allowableTags = [], tagReplacement = '') => {
  const context = initContext(allowableTags, tagReplacement)
  return html => striptagsInternal(html || '', context)
}

const striptags = (html = '', allowableTags = [], tagReplacement = '') => {
  const context = initContext(allowableTags, tagReplacement)
  return striptagsInternal(html, context)
}

striptags.init_streaming_mode = initStriptagsStream

export default striptags
