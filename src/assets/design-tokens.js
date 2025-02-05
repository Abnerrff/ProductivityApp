export const DesignTokens = {
  colors: {
    dark: {
      background: {
        darkest: '#121212',
        darker: '#1E1E1E',
        dark: '#2C2C2C',
        midDark: '#3A3A3A',
        lightDark: '#4A4A4A'
      },
      text: {
        primary: '#E0E0E0',
        secondary: '#9E9E9E',
        muted: '#6E6E6E'
      },
      accent: {
        primary: '#4CAF50',
        secondary: '#2196F3',
        danger: '#F44336',
        warning: '#FF9800',
        info: '#00BCD4'
      }
    },
    light: {
      background: {
        darkest: '#FFFFFF',
        darker: '#F5F5F5',
        dark: '#E0E0E0',
        midDark: '#D3D3D3',
        lightDark: '#C0C0C0'
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
        muted: '#999999'
      },
      accent: {
        primary: '#2E7D32',
        secondary: '#1565C0',
        danger: '#C62828',
        warning: '#EF6C00',
        info: '#00838F'
      }
    }
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    subtle: '0 1px 3px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    strong: '0 10px 15px rgba(0,0,0,0.2)',
    intense: '0 15px 25px rgba(0,0,0,0.3)'
  },
  transitions: {
    fast: 'all 0.2s ease',
    medium: 'all 0.3s ease',
    slow: 'all 0.5s ease'
  }
}

export const applyTheme = (theme = 'dark') => {
  const tokens = DesignTokens.colors[theme]
  const root = document.documentElement

  // Aplicar tokens de cores
  Object.entries(tokens.background).forEach(([key, value]) => {
    root.style.setProperty(`--background-${key}`, value)
  })

  Object.entries(tokens.text).forEach(([key, value]) => {
    root.style.setProperty(`--text-${key}`, value)
  })

  Object.entries(tokens.accent).forEach(([key, value]) => {
    root.style.setProperty(`--accent-${key}`, value)
  })
}

// Aplicar tema por padrão
if (typeof window !== 'undefined') {
  applyTheme()
}
