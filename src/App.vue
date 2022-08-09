<script setup lang="ts">
  import { jsPDF } from "jspdf";
  import { ref, computed } from "vue";
  import * as imageConversion from 'image-conversion';

  const images = ref<string[]>([]);
  const inputRendering = ref<boolean[]>([false]);
  const numberOfAttachments = ref(1);
  const isGenerating = ref(false);

  function showRandomMessage() {
    const options = ['Procesando la imagen..',
                     'Comprimiendo...',
                     'Haciendo cosas...',
                     'Aplicando filtros...',
                     'Llamando a Dios...'];
    return options[Math.floor(Math.random() * options.length)];
  }

  const isAnyInputRendering = computed(() => {
    return inputRendering.value.some(x => x);
  });


  function submit() {
    isGenerating.value = true;

    generatePDF().then(() => {
      isGenerating.value = false;
    });

  }

  async function generatePDF() {
    const doc = new jsPDF('p', 'mm','a4', true);

    images.value.forEach((image, index) => {
      const alias = `image${index}`;
      doc.setFontSize(7);
      doc.text("Page " + (index + 1), 200, 2);
      doc.addImage(image, 'JPEG', 3.5, 3.5, 203, 290, alias, "SLOW");

      if (index === images.value.length - 1) {
        doc.save('test.pdf');
      } else {
        doc.addPage();
      }
    });
  }

  async function onFileChange(event: Event, index: number) {
    inputRendering.value[index] = true;

    const file =  (event.target as HTMLInputElement).files![0];

    imageConversion.compress(
      file,
      {
        quality: 0.3,
        type: "image/jpeg"
      }).then(res=>{
      var reader = new FileReader();
      reader.readAsDataURL(res);
      reader.onload = function () {
        images.value[index] = reader.result as string;
        inputRendering.value[index] = false;
      }
    })
  }
</script>

<template>
  <div class="flex flex-col space-y-4 md:p-24 p-4 bg-white min-h-screen w-screen">
    <div class="bg-slate-300 md:p-8 p-3 rounded-md w-full">
      <div v-for="i in numberOfAttachments" :key="i" class="mb-6">
        <input type="file" :id="`file-field-${i}`" @change="onFileChange($event, i-1)" accept="image/jpg" capture="environment" class="mb-0.5">
      </div>
      <div class="flex flex-row items-center space-x-5">
        <button type="button" @click="numberOfAttachments = numberOfAttachments + 1" class="p-1 bg-gray-400 hover:bg-gray-500 rounded-md">
          Add file
        </button>
        <button type="button" @click="submit" class="p-1 bg-gray-400 hover:bg-gray-500 rounded-lg" :class="{'opacity-50': isAnyInputRendering}" :disabled="isAnyInputRendering">
          Generate
        </button>
      </div>
      <div v-if="isAnyInputRendering" class="mt-5 text-center text-black font-bold">
        <p>{{ showRandomMessage() }}</p>
      </div>
      <div v-if="isGenerating" class="mt-5 text-center text-black font-bold">
        <p>{{ showRandomMessage() }}</p>
      </div>
    </div>
  </div>
</template>