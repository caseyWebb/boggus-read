// @ts-check

'use strict'

document.querySelectorAll('img.sqip').forEach(transitionFullQuality)

function transitionFullQuality($sqip) {
  const $fq = document.createElement('img')
  $fq.classList.add('fq')
  $fq.setAttribute('src', $sqip.getAttribute('src').replace('.sqip.svg', ''))
  $sqip.insertAdjacentElement('afterend', $fq)

  const onLoad = () => setTimeout(() => $sqip.classList.add('hidden'), 500)
  
  if ($fq.complete) {
    onLoad()
  } else {
    $fq.addEventListener('load', onLoad)
  }
}