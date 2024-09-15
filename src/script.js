document.getElementById('encryptAndUpload').addEventListener('click', async () => {
    const content = document.getElementById('content').value;
    if (!content) {
        alert('Please enter some text.');
        return;
    }

    // Encrypt the content
    const password = prompt('Enter a password for encryption:');
    if (!password) {
        alert('Encryption password is required.');
        return;
    }

    const encryptedContent = await encryptContent(content, password);

    // Upload to IPFS
    const hash = await uploadToIPFS(encryptedContent);

    // Generate shareable link
    const shareLink = `${window.location.origin}/view.html?hash=${hash}&key=${btoa(password)}`;
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('linkContainer').style.display = 'block';
});

document.getElementById('copyLink').addEventListener('click', () => {
    const link = document.getElementById('shareLink');
    link.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
});

async function encryptContent(content, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );
    return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(encrypted)));
}

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
