import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage!: Storage;
  private readonly ionicStorage = inject(Storage);

  async init(): Promise<void> {
    this.storage = await this.ionicStorage.create();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.storage) await this.init();
    return this.storage.get(key) as Promise<T | null>;
  }

  async set(key: string, value: any): Promise<void> {
    if (!this.storage) await this.init();
    return this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    if (!this.storage) await this.init();
    return this.storage.remove(key);
  }

  async clear(): Promise<void> {
    if (!this.storage) await this.init();
    return this.storage.clear();
  }
}
