import axios from 'axios'

export function mockPages(pages) {
    axios.get.mockImplementation(url => (
        url in pages
            ? Promise.resolve({ data: pages[url]() })
            : Promise.reject(new Error(`unexpected request to ${url}`))
    ))
}

export function mockApiFailure(error = new Error('Network Error')) {
    axios.get.mockRejectedValue(error)
    return error
}
