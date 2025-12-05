import { ref } from 'vue'
import { createStore } from 'zustand/vanilla'
import { combine } from 'zustand/middleware'

function createVueStore() {
    const data = ref({
        button1: '1'
    });
    return {
        data,
        changeButton1(button: string) {
            data.value = {
                button1: button,
            }
        }
    }

}
export const store1 = createVueStore();

export const store2 = createStore(combine({
    button2: '1',
}, (set) => ({
    onChangeButton1: (button2: string) => {
        set(() => ({ button2 }))
    }
})))