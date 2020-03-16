import { addIMGToIconDictionary } from '../../../app/domain-story-modeler/features/iconSetCustomization/appendIconDictionary';
import { getIconSource, getAppendedIconDictionary } from '../../../app/domain-story-modeler/features/iconSetCustomization/dictionaries';
import { customConfigNameTag, customConfigTag, useCustomConfigTag } from '../../../app/domain-story-modeler/features/iconSetCustomization/persitence';
import { getIconset } from '../../../app/domain-story-modeler/language/icon/iconConfig';

const vpnKeySRC ='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 19h-6v-4h-2.68c-1.14 2.42-3.6 4-6.32 4-3.86 0-7-3.14-7-7s3.14-7 7-7c2.72 0 5.17 1.58 6.32 4H24v6h-2v4zm-4-2h2v-4h2v-2H11.94l-.23-.67C11.01 8.34 9.11 7 7 7c-2.76 0-5 2.24-5 5s2.24 5 5 5c2.11 0 4.01-1.34 4.71-3.33l.23-.67H18v4zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>';

const presetIconConfig = {
  'actors': {
    'Pet':'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><circle cx="4.5" cy="9.5" r="2.5"/><circle cx="9" cy="5.5" r="2.5"/><circle cx="15" cy="5.5" r="2.5"/><circle cx="19.5" cy="9.5" r="2.5"/><path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/></svg>'
  },
  'workObjects': {
    'Store':'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z"/></svg>'
  }
};

localStorage.removeItem(useCustomConfigTag);

describe('domainStory customIconConfig', function() {

  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
      value: function(search, pos) {
        pos = !pos || pos < 0 ? 0 : +pos;
        return this.substring(pos, pos + search.length) === search;
      }
    });
  }

  describe('append custom Icon to Dictionary', function() {

    it('custom Icon is in appended dictionary', function() {

      // given
      const name = 'customIcon';

      // when
      addIMGToIconDictionary(vpnKeySRC, name);

      // then
      const appendIconDictionary = getAppendedIconDictionary();
      const icon = getIconSource(name);

      expect(appendIconDictionary.has(name)).to.be.true;
      expect(icon).not.null;
    });

  });

  describe('custom Icon Config', function() {

    it ('loads custom icons into Iconset and Dictionary', function() {

      // given
      const presetIconConfigJSON = JSON.stringify(presetIconConfig);

      // when
      localStorage.setItem(customConfigNameTag, 'customConfigName');
      localStorage.setItem(customConfigTag, presetIconConfigJSON);
      localStorage.setItem(useCustomConfigTag, true);

      // then
      const iconSet = getIconset();
      const actors = iconSet.actors;
      const workObjects = iconSet.workObjects;


      const appendIconDictionary = getAppendedIconDictionary();
      const iconPet = getIconSource('Pet');
      const iconStore = getIconSource('Store');

      expect(actors).to.include('Pet');
      expect(workObjects).to.include('Store');

      expect(appendIconDictionary.has('Pet'));
      expect(appendIconDictionary.has('Store'));

      expect(iconPet).not.null;
      expect(iconStore).not.null;

      localStorage.removeItem(customConfigNameTag);
      localStorage.removeItem(customConfigTag);
      localStorage.removeItem(useCustomConfigTag);
    });
  });
});