document.getElementById('publish').addEventListener('click', async () => {
    const content = document.getElementById('content').value;
    if (!content) {
        alert('Please enter some text.');
        return;
    }

    // Base64 encode the content
    const encodedContent = btoa(content);

    // Upload to IPFS
    const hash = await uploadToIPFS(encodedContent);

    // Generate shareable link
    const shareLink = `${window.location.origin}/view.html?hash=${hash}`;
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('linkContainer').style.display = 'block';
});

document.getElementById('copyLink').addEventListener('click', () => {
    const link = document.getElementById('shareLink');
    link.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
});

async function uploadToIPFS(content) {
    const formData = new FormData();
    formData.append('file', new Blob([content], { type: 'text/plain' }));

    const response = await fetch('https://cdn.ipfsscan.io/api/v0/add?pin=false', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return data.Hash;
}
