document.getElementById('usePassword').addEventListener('change', function() {
    const passwordContainer = document.getElementById('passwordContainer');
    passwordContainer.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('publish').addEventListener('click', async () => {
    const content = document.getElementById('content').value;
    if (!content) {
        alert('Please enter some text.');
        return;
    }

    let encryptedContent;
    const usePassword = document.getElementById('usePassword').checked;
    if (usePassword) {
        const password = document.getElementById('password').value;
        if (!password) {
            alert('Please enter a password.');
            return;
        }
        encryptedContent = await encryptContent(content, password);
    } else {
        encryptedContent = btoa(content); // Base64 encode if no password
    }

    // Upload to IPFS
    const hash = await uploadToIPFS(encryptedContent);

    // Generate shareable link
    const shareLink = `${window.location.origin}/view.html?hash=${hash}&key=${usePassword ? btoa(password) : ''}`;
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

    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.Hash;
}