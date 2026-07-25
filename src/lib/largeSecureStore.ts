import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store caps values at 2048 bytes, which a Supabase session (access +
// refresh token) can exceed. So we store a small AES key in SecureStore and the
// actual (encrypted) session blob in AsyncStorage, which has no such limit.
export class LargeSecureStore {
  private async getOrCreateKey(name: string): Promise<Uint8Array> {
    const keyName = `${name}-key`;
    const existing = await SecureStore.getItemAsync(keyName);
    if (existing) return aesjs.utils.hex.toBytes(existing);

    const key = await Crypto.getRandomBytesAsync(32);
    await SecureStore.setItemAsync(keyName, aesjs.utils.hex.fromBytes(key));
    return key;
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;

    const encryptionKey = await this.getOrCreateKey(key);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(encrypted));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = await this.getOrCreateKey(key);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encryptedBytes));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`${key}-key`);
  }
}
