import stripHTMLTags from '../src'

describe('Plugin "strip-html-tags"', () => {
  describe('With no optional parameters', () => {
    it('Should not strip invalid tags', () => {
      const text = 'lorem ipsum < a> < div>'
      expect(stripHTMLTags(text)).toBe(text)
    })
    it('Should remove simple HTML tags', () => {
      const html = '<a href="">lorem <strong>ipsum</strong></a>'
      const text = 'lorem ipsum'
      expect(stripHTMLTags(html)).toBe(text)
    })
    it('Should remove comments', () => {
      const html = '<!-- lorem -- ipsum -- --> dolor sit amet'
      const text = ' dolor sit amet'
      expect(stripHTMLTags(html)).toBe(text)
    })
    it('Should strip tags within comments', () => {
      const html = '<!-- <strong>lorem ipsum</strong> --> dolor sit'
      const text = ' dolor sit'
      expect(stripHTMLTags(html)).toBe(text)
    })
    it('Should not fail with nested quotes', () => {
      const html = '<article attr="foo \'bar\'">lorem</article> ipsum'
      const text = 'lorem ipsum'
      expect(stripHTMLTags(html)).toBe(text)
    })
  })

  describe('Allowed_tags', () => {
    it('Should parse a string', () => {
      const html = '<strong>lorem ipsum</strong>'
      const allowedTags = '<strong>'
      expect(stripHTMLTags(html, allowedTags)).toBe(html)
    })
    it('Should take an array', () => {
      const html = '<strong>lorem <em>ipsum</em></strong>'
      const allowedTags = ['strong', 'em']
      expect(stripHTMLTags(html, allowedTags)).toBe(html)
    })
  })

  describe('With "allowedTags" parameter', () => {
    it('Should leave attributes when allowing HTML', () => {
      const html = '<a href="https://example.com">lorem ipsum</a>'
      const allowedTags = '<a>'
      expect(stripHTMLTags(html, allowedTags)).toBe(html)
    })
    it('Should strip extra < within tags', () => {
      const html = '<div<>>lorem ipsum</div>'
      const text = '<div>lorem ipsum</div>'
      const allowedTags = '<div>'
      expect(stripHTMLTags(html, allowedTags)).toBe(text)
    })
    it('Should strip <> within quotes', () => {
      const html = '<a href="<script>">lorem ipsum</a>'
      const text = '<a href="script">lorem ipsum</a>'
      const allowedTags = '<a>'
      expect(stripHTMLTags(html, allowedTags)).toBe(text)
    })
  })

  describe('With "tagReplacement" parameter', () => {
    it('Should replace tags with that parameter', () => {
      const html = 'Line One<br>Line Two'
      const tagReplacement = '\n'
      const text = 'Line One\nLine Two'
      expect(stripHTMLTags(html, [], tagReplacement)).toBe(text)
    })
  })

  describe('Streaming_mode', () => {
    it('Should strip streamed HTML', () => {
      const stripHTMLTagsStream = stripHTMLTags.init_streaming_mode()
      const partOne = stripHTMLTagsStream('lorem ipsum <stro')
      const partTwo = stripHTMLTagsStream('ng>dolor sit <')
      const partThree = stripHTMLTagsStream(' amet')

      expect(partOne).toBe('lorem ipsum ')
      expect(partTwo).toBe('dolor sit ')
      expect(partThree).toBe('< amet')
    })
    it('Should work with allowable tags', () => {
      const stripHTMLTagsStream = stripHTMLTags.init_streaming_mode(['strong'])
      const partOne = stripHTMLTagsStream('lorem ipsum <stro')
      const partTwo = stripHTMLTagsStream('ng>dolor sit <')
      const partThree = stripHTMLTagsStream(' amet')

      expect(partOne).toBe('lorem ipsum ')
      expect(partTwo).toBe('<strong>dolor sit ')
      expect(partThree).toBe('< amet')
    })
  })
})
