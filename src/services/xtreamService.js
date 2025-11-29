const axios = require('axios');

/**
 * Servicio para interactuar con la API de Xtream Codes
 * Documentación: http://example.com:port/player_api.php
 */
class XtreamService {
  constructor() {
    this.timeout = 10000; // 10 segundos
  }

  /**
   * Construye la URL base para las peticiones a la API
   * @param {string} serverUrl - URL del servidor (ej: http://example.com:8080)
   * @param {string} username - Usuario de Xtream
   * @param {string} password - Contraseña de Xtream
   * @returns {string} URL base
   */
  _buildBaseUrl(serverUrl, username, password) {
    // Remover trailing slash si existe
    const cleanUrl = serverUrl.replace(/\/$/, '');
    return `${cleanUrl}/player_api.php?username=${username}&password=${password}`;
  }

  /**
   * Autentica al usuario contra la API de Xtream Codes
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Información del usuario
   */
  async authenticate(serverUrl, username, password) {
    try {
      const url = this._buildBaseUrl(serverUrl, username, password);
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      // Verificar si la autenticación fue exitosa
      if (!response.data || !response.data.user_info) {
        throw new Error('Invalid credentials or server response');
      }

      return {
        success: true,
        userInfo: response.data.user_info,
        serverInfo: response.data.server_info
      };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid credentials');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout - server not responding');
      }
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server - check URL');
      }
      throw error;
    }
  }

  /**
   * Obtiene las categorías de canales en vivo
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Array>} Lista de categorías
   */
  async getLiveCategories(serverUrl, username, password) {
    try {
      const baseUrl = this._buildBaseUrl(serverUrl, username, password);
      const url = `${baseUrl}&action=get_live_categories`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return response.data || [];
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Obtiene los streams de una categoría de canales en vivo
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @param {string|number} categoryId - ID de la categoría
   * @returns {Promise<Array>} Lista de streams
   */
  async getLiveStreams(serverUrl, username, password, categoryId) {
    try {
      const baseUrl = this._buildBaseUrl(serverUrl, username, password);
      const url = `${baseUrl}&action=get_live_streams&category_id=${categoryId}`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return response.data || [];
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Obtiene todas las streams de canales en vivo (sin filtro de categoría)
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Array>} Lista de todos los streams
   */
  async getAllLiveStreams(serverUrl, username, password) {
    try {
      const baseUrl = this._buildBaseUrl(serverUrl, username, password);
      const url = `${baseUrl}&action=get_live_streams`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return response.data || [];
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Obtiene las categorías de VOD (películas/series)
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Array>} Lista de categorías VOD
   */
  async getVodCategories(serverUrl, username, password) {
    try {
      const baseUrl = this._buildBaseUrl(serverUrl, username, password);
      const url = `${baseUrl}&action=get_vod_categories`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return response.data || [];
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Obtiene los streams VOD de una categoría específica
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @param {string|number} categoryId - ID de la categoría
   * @returns {Promise<Array>} Lista de streams VOD
   */
  async getVodStreams(serverUrl, username, password, categoryId) {
    try {
      const baseUrl = this._buildBaseUrl(serverUrl, username, password);
      const url = `${baseUrl}&action=get_vod_streams&category_id=${categoryId}`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return response.data || [];
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Obtiene información detallada de un VOD específico
   * @param {string} serverUrl - URL del servidor
   * @param {string} username - Usuario
   * @param {string} password - Contraseña
   * @param {string|number} vodId - ID del VOD
   * @returns {Promise<Object>} Información del VOD
   */
  async getVodInfo(serverUrl, username, password, vodId) {
    try {
      const baseUrl = this._buildBaseUrl(serverUrl, username, password);
      const url = `${baseUrl}&action=get_vod_info&vod_id=${vodId}`;

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      return response.data || {};
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   * @private
   * @param {Error} error - Error de Axios
   * @throws {Error} Error formateado
   */
  _handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de error
      throw new Error(`Server error: ${error.response.status}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout - server not responding');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server - check URL');
    } else {
      throw error;
    }
  }
}

module.exports = new XtreamService();
