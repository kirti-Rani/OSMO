export const localTokenService = {
  getTokens: () => JSON.parse(localStorage.getItem('tokens') || '[]'),
  
  saveTokens: (tokens) => {
    localStorage.setItem('tokens', JSON.stringify(tokens));
    window.dispatchEvent(new Event('tokens_updated'));
  },
  
  requestToken: async (studentId, studentName, serviceType) => {
    const tokens = localTokenService.getTokens();
    const tokenNumber = tokens.length > 0 ? Math.max(...tokens.map(t => t.tokenNumber)) + 1 : 101;
    
    // Format service type properly
    const formattedService = serviceType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
    
    const newToken = {
      id: '#' + Math.floor(Math.random() * 900 + 100),
      studentId,
      studentName,
      serviceType: formattedService,
      status: 'pending',
      tokenNumber,
      wait: '10 mins',
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      counter: null
    };
    
    // Add to beginning of array for newest first
    tokens.unshift(newToken);
    localTokenService.saveTokens(tokens);
    return newToken;
  },

  subscribeToTokens: (callback) => {
    const update = () => callback(localTokenService.getTokens());
    // Initial fetch
    update();
    // Listen for custom event (same tab)
    window.addEventListener('tokens_updated', update);
    // Listen for storage event (cross-tab)
    window.addEventListener('storage', update);
    
    return () => {
      window.removeEventListener('tokens_updated', update);
      window.removeEventListener('storage', update);
    };
  },

  updateTokenStatus: async (tokenId, status, counter, extraData = {}) => {
    const tokens = localTokenService.getTokens().map(t => 
      t.id === tokenId ? { ...t, status, ...(counter ? { counter } : {}), ...extraData } : t
    );
    localTokenService.saveTokens(tokens);
  }
};
