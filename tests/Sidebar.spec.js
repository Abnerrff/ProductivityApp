import { mount } from '@vue/test-utils'
import Sidebar from '../src/components/layout/Sidebar.vue'
import { describe, it, expect } from 'vitest'

describe('Sidebar Component', () => {
  it('renderiza corretamente', () => {
    const wrapper = mount(Sidebar)
    
    // Verifica se todos os itens do menu são renderizados
    const menuItems = wrapper.findAll('.sidebar-item')
    expect(menuItems.length).toBe(6)
  })

  it('alterna corretamente entre abas', async () => {
    const wrapper = mount(Sidebar)
    
    // Simula clique em uma aba
    const projectsTab = wrapper.findAll('.sidebar-item')[1]
    await projectsTab.trigger('click')
    
    // Verifica se a aba está ativa
    expect(projectsTab.classes()).toContain('active')
  })

  it('emite evento ao trocar de aba', async () => {
    const wrapper = mount(Sidebar)
    
    const projectsTab = wrapper.findAll('.sidebar-item')[1]
    await projectsTab.trigger('click')
    
    // Verifica se o evento foi emitido
    expect(wrapper.emitted('tab-changed')).toBeTruthy()
    expect(wrapper.emitted('tab-changed')[0]).toEqual(['projects'])
  })
})
