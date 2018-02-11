async function renderPdfElement(el) {
  await loadPDFJS()

  const { PDFJS } = window
  const url = el.getAttribute('data-src')
  const container = createContainer(el)
  const SCALE = 1.0

  const pdfPage = await PDFJS.getDocument(url).then((d) => d.getPage(1))

  const pdfPageView = new PDFJS.PDFPageView({
    container,
    id: 1,
    scale: SCALE,
    defaultViewport: pdfPage.getViewport(SCALE),
    textLayerFactory: new PDFJS.DefaultTextLayerFactory()
  })

  pdfPageView.setPdfPage(pdfPage)

  await pdfPageView.draw()
}

function renderPdfElements() {
  for (const el of document.getElementsByTagName('pdf')) {
    renderPdfElement(el).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to render pdf', err)
    })
  }
}

async function loadPDFJS() {
  const styles = document.createElement('link')
  styles.setAttribute('rel', 'stylesheet')
  styles.setAttribute('href', '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.354/pdf_viewer.css')
  document.body.appendChild(styles)

  await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/web/pdf_viewer')
  ]).then(() => {
    // needs to be updated whenever the pdfjs dependency is updated
    window.PDFJS.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.354/pdf.worker.min.js'
  })
}

function createContainer(el) {
  const container = document.createElement('div')
  container.classList.add('pdfViewer')
  container.classList.add('singlePageView')
  el.appendChild(container)
  return container
}

document.addEventListener('pjax:complete', renderPdfElements)
renderPdfElements()