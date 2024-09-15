(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get('hash');

    if (!hash) {
        document.getElementById('contentDisplay').innerText = 'Invalid link.';
        return;
    }

    try {
        const content = await fetchFromIPFS(hash);
        const decodedContent = atob(content);
        document.getElementById('contentDisplay').innerHTML = marked(decodedContent);
    } catch (error) {
        document.getElementById('contentDisplay').innerText = 'Error fetching content.';
        console.error(error);
    }
})();

async function fetchFromIPFS(hash) {
    const response = await fetch(`https://cdn.ipfsscan.io/ipfs/${hash}`);
    if (!response.ok) {
        throw new Error('Failed to fetch content from IPFS');
    }
    return response.text();
}
