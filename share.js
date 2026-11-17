(() => {
  function notify(message) {
    let toast = document.querySelector('.share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'share-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { toast.hidden = true; }, 2400);
  }

  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('Clipboard copy failed');
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-share-url]');
    if (!button) return;
    const url = new URL(button.dataset.shareUrl, window.location.origin).href;
    const title = button.dataset.shareTitle || document.title;
    const text = button.dataset.shareText || title;
    try {
      if (navigator.share) await navigator.share({title, text, url});
      else { await copy(url); notify('Link copied'); }
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        try { await copy(url); notify('Link copied'); } catch (_) { notify('Could not copy link'); }
      }
    }
  });
})();
