// auth.js - Manejo de autenticación con Cognito
class CognitoAuth {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.init();
    }

    init() {
        // Verificar si hay tokens válidos al cargar la página
        this.checkAuthStatus();
    }

    // Verificar si el usuario está autenticado
    checkAuthStatus() {
        const accessToken = localStorage.getItem('cognito_access_token');
        const timestamp = localStorage.getItem('cognito_timestamp');
        const expiresIn = localStorage.getItem('cognito_expires_in');

        if (!accessToken || !timestamp || !expiresIn) {
            this.isAuthenticated = false;
            return false;
        }

        // Verificar si el token ha expirado
        const now = Date.now();
        const tokenTime = parseInt(timestamp);
        const tokenExpiry = tokenTime + (parseInt(expiresIn) * 1000);

        if (now >= tokenExpiry) {
            // Token expirado, intentar renovar
            this.refreshToken();
            return false;
        }

        this.isAuthenticated = true;
        this.user = this.parseUserFromToken(accessToken);
        return true;
    }

    // Parsear información del usuario desde el token
    parseUserFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                sub: payload.sub,
                email: payload.email,
                email_verified: payload.email_verified,
                name: payload.name || payload.email
            };
        } catch (err) {
            console.error('Error parseando token:', err);
            return null;
        }
    }

    // Redirigir a Cognito Hosted UI para login
    login() {
        const cognitoDomain = window.API_CONFIG.cognito.domain;
        const clientId = window.API_CONFIG.cognito.clientId;
        const redirectUri = window.API_CONFIG.cognito.redirectUri;
        const responseType = 'code';
        const scope = 'email openid profile';

        const loginUrl = `https://${cognitoDomain}/login?` +
            `client_id=${clientId}&` +
            `response_type=${responseType}&` +
            `scope=${scope}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}`;

        window.location.href = loginUrl;
    }

    // Redirigir a Cognito Hosted UI para registro
    signup() {
        const cognitoDomain = window.API_CONFIG.cognito.domain;
        const clientId = window.API_CONFIG.cognito.clientId;
        const redirectUri = window.API_CONFIG.cognito.redirectUri;
        const responseType = 'code';
        const scope = 'email openid profile';

        const signupUrl = `https://${cognitoDomain}/signup?` +
            `client_id=${clientId}&` +
            `response_type=${responseType}&` +
            `scope=${scope}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}`;

        window.location.href = signupUrl;
    }

    // Cerrar sesión
    logout() {
        // Limpiar tokens del localStorage
        localStorage.removeItem('cognito_access_token');
        localStorage.removeItem('cognito_id_token');
        localStorage.removeItem('cognito_refresh_token');
        localStorage.removeItem('cognito_token_type');
        localStorage.removeItem('cognito_expires_in');
        localStorage.removeItem('cognito_timestamp');

        this.isAuthenticated = false;
        this.user = null;

        // Redirigir al index después del logout
        window.location.href = 'index.html';
    }

    // Renovar token usando refresh token
    async refreshToken() {
        const refreshToken = localStorage.getItem('cognito_refresh_token');
        
        if (!refreshToken) {
            this.isAuthenticated = false;
            return false;
        }

        try {
            const cognitoDomain = window.API_CONFIG.cognito.domain;
            const clientId = window.API_CONFIG.cognito.clientId;

            const tokenUrl = `https://${cognitoDomain}/oauth2/token`;
            
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: clientId,
                refresh_token: refreshToken
            });

            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const tokens = await response.json();
            
            // Actualizar tokens en localStorage
            localStorage.setItem('cognito_access_token', tokens.access_token);
            localStorage.setItem('cognito_id_token', tokens.id_token);
            localStorage.setItem('cognito_refresh_token', tokens.refresh_token);
            localStorage.setItem('cognito_token_type', tokens.token_type);
            localStorage.setItem('cognito_expires_in', tokens.expires_in);
            localStorage.setItem('cognito_timestamp', Date.now().toString());

            this.isAuthenticated = true;
            this.user = this.parseUserFromToken(tokens.access_token);
            return true;

        } catch (err) {
            console.error('Error renovando token:', err);
            this.logout();
            return false;
        }
    }

    // Obtener token de acceso actual
    getAccessToken() {
        const token = localStorage.getItem('cognito_access_token');
        console.log('Getting access token:', token ? 'Token found' : 'No token');
        if (token) {
            console.log('Token preview:', token.substring(0, 50) + '...');
        }
        return token;
    }

    // Obtener información del usuario
    getUser() {
        return this.user;
    }

    // Verificar si está autenticado
    isLoggedIn() {
        // Verificar primero en localStorage
        const accessToken = localStorage.getItem('cognito_access_token');
        const timestamp = localStorage.getItem('cognito_timestamp');
        const expiresIn = localStorage.getItem('cognito_expires_in');

        if (!accessToken || !timestamp || !expiresIn) {
            this.isAuthenticated = false;
            this.user = null;
            return false;
        }

        // Verificar si el token ha expirado
        const now = Date.now();
        const tokenTime = parseInt(timestamp);
        const tokenExpiry = tokenTime + (parseInt(expiresIn) * 1000);

        if (now >= tokenExpiry) {
            this.isAuthenticated = false;
            this.user = null;
            return false;
        }

        // Si llegamos aquí, el token es válido
        this.isAuthenticated = true;
        if (!this.user) {
            this.user = this.parseUserFromToken(accessToken);
        }
        
        return true;
    }

    // Función de debugging para verificar tokens
    debugTokens() {
        console.log('=== DEBUG TOKENS ===');
        console.log('isAuthenticated:', this.isAuthenticated);
        console.log('user:', this.user);
        console.log('accessToken:', localStorage.getItem('cognito_access_token') ? 'Presente' : 'Ausente');
        console.log('refreshToken:', localStorage.getItem('cognito_refresh_token') ? 'Presente' : 'Ausente');
        console.log('timestamp:', localStorage.getItem('cognito_timestamp'));
        console.log('expiresIn:', localStorage.getItem('cognito_expires_in'));
        console.log('==================');
    }

    // Login directo con email y contraseña
    async loginWithPassword(email, password) {
        try {
            console.log('Iniciando login con:', email);
            console.log('API_CONFIG:', window.API_CONFIG);
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: window.API_CONFIG.cognito.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };

            console.log('Parámetros de login:', params);

            const response = await this.cognitoRequest('InitiateAuth', params);
            
            console.log('Respuesta de Cognito:', response);
            
            if (response.AuthenticationResult) {
                console.log('Guardando tokens...');
                this._saveTokens(response.AuthenticationResult);
                this.isAuthenticated = true;
                this.user = this.parseUserFromToken(response.AuthenticationResult.AccessToken);
                console.log('Login exitoso, usuario:', this.user);
                return response.AuthenticationResult;
            } else {
                console.error('No hay AuthenticationResult en la respuesta');
                throw new Error('Error en la autenticación');
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw new Error(this._getErrorMessage(error));
        }
    }

    // Signup directo con email y contraseña
    async signupWithPassword(email, password) {
        try {
            const params = {
                ClientId: window.API_CONFIG.cognito.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: email
                    }
                ]
            };

            const response = await this.cognitoRequest('SignUp', params);
            
            if (response.UserSub) {
                return response;
            } else {
                throw new Error('Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Error en signup:', error);
            throw new Error(this._getErrorMessage(error));
        }
    }

    // Confirmar signup con código
    async confirmSignup(email, code) {
        try {
            const params = {
                ClientId: window.API_CONFIG.cognito.clientId,
                Username: email,
                ConfirmationCode: code
            };

            const response = await this.cognitoRequest('ConfirmSignUp', params);
            return response;
        } catch (error) {
            console.error('Error en confirmación:', error);
            throw new Error(this._getErrorMessage(error));
        }
    }

    // Función para hacer requests a Cognito usando AWS SDK
    async cognitoRequest(action, params) {
        try {
            console.log('Iniciando cognitoRequest:', action, params);
            
            // Verificar si AWS SDK está disponible
            if (typeof AWS === 'undefined') {
                console.error('AWS SDK no está disponible');
                throw new Error('AWS SDK no está cargado');
            }
            
            if (!AWS.CognitoIdentityServiceProvider) {
                console.error('AWS CognitoIdentityServiceProvider no está disponible');
                throw new Error('AWS CognitoIdentityServiceProvider no está disponible');
            }
            
            console.log('AWS SDK disponible, creando cliente Cognito...');
            
            const cognito = new AWS.CognitoIdentityServiceProvider({
                region: window.API_CONFIG.region
            });
            
            console.log('Cliente Cognito creado, llamando método:', action);
            
            // Mapear nombres de métodos
            const methodMap = {
                'InitiateAuth': 'initiateAuth',
                'SignUp': 'signUp',
                'ConfirmSignUp': 'confirmSignUp'
            };
            
            const methodName = methodMap[action];
            if (!methodName) {
                throw new Error(`Método no soportado: ${action}`);
            }
            
            const method = cognito[methodName];
            if (!method) {
                throw new Error(`Método ${methodName} no existe en el cliente Cognito`);
            }
            
            console.log('Llamando método:', methodName, 'con parámetros:', params);
            
            const result = await method.call(cognito, params).promise();
            console.log('Resultado de Cognito:', result);
            
            return result;
            
        } catch (error) {
            console.error('Error en cognitoRequest:', error);
            throw error;
        }
    }

    // Guardar tokens en localStorage
    _saveTokens(authResult) {
        console.log('Guardando tokens:', authResult);
        
        localStorage.setItem('cognito_access_token', authResult.AccessToken);
        localStorage.setItem('cognito_id_token', authResult.IdToken);
        localStorage.setItem('cognito_refresh_token', authResult.RefreshToken);
        localStorage.setItem('cognito_token_type', authResult.TokenType);
        localStorage.setItem('cognito_expires_in', authResult.ExpiresIn);
        localStorage.setItem('cognito_timestamp', Date.now().toString());
        
        console.log('Tokens guardados en localStorage');
        console.log('Access Token:', authResult.AccessToken ? 'Presente' : 'Ausente');
        console.log('Refresh Token:', authResult.RefreshToken ? 'Presente' : 'Ausente');
    }

    // Obtener mensaje de error legible
    _getErrorMessage(error) {
        if (error.message) {
            if (error.message.includes('UserNotFoundException')) {
                return 'Usuario no encontrado';
            } else if (error.message.includes('NotAuthorizedException')) {
                return 'Contraseña incorrecta';
            } else if (error.message.includes('UserNotConfirmedException')) {
                return 'Usuario no confirmado. Revisa tu email';
            } else if (error.message.includes('UsernameExistsException')) {
                return 'El usuario ya existe';
            } else if (error.message.includes('InvalidPasswordException')) {
                return 'La contraseña no cumple con los requisitos';
            } else if (error.message.includes('InvalidParameterException')) {
                return 'Parámetros inválidos';
            }
        }
        return error.message || 'Error desconocido';
    }
}

// Crear instancia global
window.cognitoAuth = new CognitoAuth();
