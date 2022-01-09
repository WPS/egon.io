import { Injectable } from '@angular/core';
import { StorageService } from '../BrowserStorage/storage.service';
import { RendererService } from '../Renderer/renderer.service';
import { TitleService } from '../Title/title.service';
import { SaveState } from '../../Domain/SaveState/saveState';

/**
 * A service for creating and loading the current state of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class SaveStateService {

  constructor(
    private rendererService: RendererService,
    private storageService: StorageService,
    private titleService: TitleService
  ) {
  }

  /**
   * Saves the current state.
   */
  public createSaveState(): SaveState {
    const saveState = {
      title: this.titleService.getTitle(),
      description: this.titleService.getDescription(),
      domainStory: this.rendererService.getStory()
    }
    this.storageService.setSaveState(saveState);
    return saveState;
  }

  /**
   * Loads and renders the last saved state.
   */
  public loadSaveState(): SaveState | undefined {
    const saveState = this.storageService.getSaveState();
    if (saveState) {
      this.titleService.updateTitleAndDescription(saveState.title, saveState.description, false);
      this.rendererService.renderStory(saveState.domainStory)
      return saveState;
    }
    return;
  }

}
