async function setUserAvatar(): Promise<void> {
    const user = await System.users.getCurrentUser();
    const newImg = await user.fields.avatar.create("avatar.jpg", base64ToArrayBuffer(Context.data.avatar_base64!));
    user.data.avatar = newImg;
    await user.save();
};

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binaryString = atob(base64);
    let bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    };

    return bytes.buffer;
};