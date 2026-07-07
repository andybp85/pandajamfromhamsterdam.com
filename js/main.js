// PandaJAM archive: one search call fetches every jam's identifier, date, and
// description, so the sidebar renders as the list streams in instead of waiting
// on a metadata request per jam. Descriptions ride along, so selecting a jam
// needs no further network round-trip.

const searchUrl = () => {
    const params = new URLSearchParams()
    params.set('q', 'creator:"PandaJAM From HamsterDAM"')
    params.append('fl[]', 'identifier')
    params.append('fl[]', 'date')
    params.append('fl[]', 'description')
    params.append('sort[]', 'date desc')
    params.set('rows', '500')
    params.set('output', 'json')
    return `https://archive.org/advancedsearch.php?${params}`
}

const descriptions = new Map()

const wrapper = document.querySelector('#wrapper')
const homeContent = document.querySelector('#home_content')
const jamplayer = document.querySelector('#jamplayer')
const jamdeetz = document.querySelector('#jamdeetz')

const renderJamLink = ({date, identifier}) => {
    const link = document.createElement('a')
    link.href = `#${identifier}`
    link.textContent = date.slice(0, 10)

    const separator = document.createElement('div')
    separator.className = 'jam_seperator'

    const item = document.createElement('li')
    item.className = 'jam_link'
    item.append(link, separator)
    return item
}

const archiveEmbed = id => {
    const short = window.innerHeight < 600
    const iframe = document.createElement('iframe')
    iframe.allowFullscreen = true
    iframe.height = short ? 200 : 300
    iframe.src = `https://archive.org/embed/${id}?playlist=1`
    iframe.title = `PandaJAM ${id}`
    iframe.width = short ? 300 : 350
    iframe.addEventListener('load', () => jamplayer.classList.remove('loading'))
    return iframe
}

const showHome = () => {
    jamplayer.replaceChildren()
    jamplayer.classList.remove('loading')
    jamdeetz.replaceChildren()
    homeContent.hidden = false
}

const showJam = id => {
    homeContent.hidden = true
    jamplayer.classList.add('loading')
    jamplayer.replaceChildren(archiveEmbed(id))
    jamdeetz.innerHTML = descriptions.get(id) ?? ''
}

const route = () => {
    const id = location.hash.slice(1)
    wrapper.classList.remove('toggled')
    if (id && id !== 'menu-toggle') showJam(id)
    else showHome()
}

const loadJams = async () => {
    const list = document.querySelector('#jam_list')
    const loading = document.querySelector('#loading-jams')
    try {
        const res = await fetch(searchUrl())
        if (!res.ok) throw new Error(`archive.org search returned ${res.status}`)
        const {response} = await res.json()
        for (const doc of response.docs) {
            descriptions.set(doc.identifier, doc.description ?? '')
            list.append(renderJamLink(doc))
        }
        list.classList.remove('loading')
        loading.remove()
        if (location.hash.slice(1)) route()
    } catch (err) {
        console.error('Failed to load jams', err)
        loading.textContent = 'Could not load jams. Try again later.'
    }
}

document.querySelector('#year').textContent = new Date().getFullYear()

document.querySelector('#menu-toggle').addEventListener('click', e => {
    e.preventDefault()
    wrapper.classList.toggle('toggled')
})

window.addEventListener('hashchange', route)

loadJams()
