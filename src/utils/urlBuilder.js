/**
 * Constructor de URLs de streaming para Xtream Codes
 */
class UrlBuilder {
    /**
     * Construye la URL para reproducir un canal en vivo
     * @param {string} serverUrl - URL del servidor (ej: http://example.com:8080)
     * @param {string} username - Usuario
     * @param {string} password - Contraseña
     * @param {string|number} streamId - ID del stream
     * @param {string} extension - Extensión del archivo (default: 'ts')
     * @returns {string} URL completa del stream
     */
    buildLiveUrl(serverUrl, username, password, streamId, extension = 'ts') {
        const cleanUrl = this._cleanServerUrl(serverUrl);
        return `${cleanUrl}/live/${username}/${password}/${streamId}.${extension}`;
    }

    /**
     * Construye la URL para reproducir contenido VOD (películas)
     * @param {string} serverUrl - URL del servidor
     * @param {string} username - Usuario
     * @param {string} password - Contraseña
     * @param {string|number} streamId - ID del VOD
     * @param {string} extension - Extensión del archivo (ej: 'mp4', 'mkv')
     * @returns {string} URL completa del VOD
     */
    buildVodUrl(serverUrl, username, password, streamId, extension = 'mp4') {
        const cleanUrl = this._cleanServerUrl(serverUrl);
        return `${cleanUrl}/movie/${username}/${password}/${streamId}.${extension}`;
    }

    /**
     * Construye la URL para reproducir episodios de series
     * @param {string} serverUrl - URL del servidor
     * @param {string} username - Usuario
     * @param {string} password - Contraseña
     * @param {string|number} streamId - ID del episodio
     * @param {string} extension - Extensión del archivo
     * @returns {string} URL completa del episodio
     */
    buildSeriesUrl(serverUrl, username, password, streamId, extension = 'mp4') {
        const cleanUrl = this._cleanServerUrl(serverUrl);
        return `${cleanUrl}/series/${username}/${password}/${streamId}.${extension}`;
    }

    /**
     * Construye la URL para obtener el logo/icono de un canal
     * @param {string} serverUrl - URL del servidor
     * @param {string} iconPath - Path relativo del icono
     * @returns {string} URL completa del icono
     */
    buildIconUrl(serverUrl, iconPath) {
        if (!iconPath) return null;

        // Si ya es una URL completa, retornarla
        if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
            return iconPath;
        }

        const cleanUrl = this._cleanServerUrl(serverUrl);
        const cleanPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
        return `${cleanUrl}${cleanPath}`;
    }

    /**
     * Limpia la URL del servidor removiendo trailing slashes
     * @private
     * @param {string} serverUrl - URL a limpiar
     * @returns {string} URL limpia
     */
    _cleanServerUrl(serverUrl) {
        return serverUrl.replace(/\/+$/, '');
    }

    /**
     * Valida que los parámetros necesarios estén presentes
     * @param {Object} params - Parámetros a validar
     * @param {Array<string>} required - Campos requeridos
     * @returns {boolean} true si es válido
     * @throws {Error} Si falta algún parámetro
     */
    validateParams(params, required) {
        for (const field of required) {
            if (!params[field]) {
                throw new Error(`Missing required parameter: ${field}`);
            }
        }
        return true;
    }
}

module.exports = new UrlBuilder();
