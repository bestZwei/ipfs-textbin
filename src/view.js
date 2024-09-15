(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get('hash');
    const key = urlParams.get('key') ? atob(urlParams.get('key')) : null;

    if (!hash) {
        document.getElementById('contentDisplay').innerText = 'Invalid link.';
        return;
    }

    try {
        const content = await fetchFromIPFS(hash);
        const decryptedContent = key ? await decryptContent(content, key) : atob(content);
        document.getElementById('contentDisplay').innerHTML = marked(decryptedContent);
    } catch (error) {
        document.getElementById('contentDisplay').innerText = 'Error fetching or decrypting content.';
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

async function decryptContent(encryptedContent, password) {
    const data = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}
