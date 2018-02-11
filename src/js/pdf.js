async function renderPdfElement(el) {
  const styles = document.createElement('link')
  styles.setAttribute('rel', 'stylesheet')
  styles.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.347/pdf_viewer.css')
  document.body.appendChild(styles)

  await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/web/pdf_viewer')
  ])
  
  PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'
  
  const container = document.createElement('div')
  const viewer = document.createElement('div')
  const url = el.getAttribute('data-src')

  viewer.classList.add('pdfViewer')
  container.appendChild(viewer)
  el.appendChild(container)

  const pdfLinkService = new PDFJS.PDFLinkService()
  
  const pdfSinglePageViewer = new PDFJS.PDFSinglePageViewer({
    container: container,
    linkService: pdfLinkService
  })

  container.addEventListener('pagesinit', () => pdfSinglePageViewer.currentScaleValue = 'page-width')
    
  const pdfDocument = await PDFJS.getDocument(url)
    
  pdfLinkService.setViewer(pdfSinglePageViewer)
  pdfSinglePageViewer.setDocument(pdfDocument)
  pdfLinkService.setDocument(pdfDocument, null)
}

function renderPdfElements() {
  for (const el of document.getElementsByTagName('pdf')) renderPdfElement(el)
}

document.addEventListener('pjax:complete', renderPdfElements)
renderPdfElements()