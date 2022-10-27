<script setup lang="ts">
  import { jsPDF } from "jspdf";
  import { ref, computed } from "vue";
  import * as imageConversion from 'image-conversion';

  const images = ref<string[]>([]);
  const inputRendering = ref<boolean[]>([false]);
  const numberOfAttachments = ref(1);
  const isGenerating = ref(false);
  const filename = ref<string>('Pregunta-1');
  const customFilenameSelected = computed(() =>
    new RegExp('Pregunta-[0-9]+').test(filename.value) ? false : true
  );
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

  const computedFilename = computed(() => {
    return filename.value.length > 0 ? filename.value + ".pdf" : "archivo.pdf";
  }
  );

  function removeImage(index: number) {
    // remove image from array and reorganize if the file ammount is 1 then only remove the image but not the space on the array
    if (images.value.length > 1) {
      images.value.splice(index, 1);
      inputRendering.value.splice(index, 1);
      numberOfAttachments.value--;
    } else {
      images.value = [];
      inputRendering.value = [];
    }
  }

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
        doc.save(computedFilename.value);
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
        type: 'image/jpeg' as imageConversion.EImageType
      }).then(res=>{
      var reader = new FileReader();
      reader.readAsDataURL(res);
      reader.onload = function () {
        images.value[index] = reader.result as string;
        inputRendering.value[index] = false;
      }
    }).finally(() => {
      inputRendering.value[index] = false;
    });
  }
</script>

<template>
  <div class="flex flex-col space-y-4 md:p-24 p-4 bg-gradient-to-br from-blue-600 to-red-600 min-h-screen">
    <div class="bg-gray-100 md:p-8 p-3 rounded-md w-full">
      <div class="flex flex-col rounded-md mb-6 justify-center">
        <h2 class="text-xl font-semibold mb-3"> Selecciona un nombre para el archivo </h2>
        <div>
          <input type="radio" id="Pregunta-1" v-model="filename" value="Pregunta-1" class="mx-1" checked>
          <label for="Pregunta-1" class="mx-2">Pregunta 1</label>
        </div>
        <div>
          <input type="radio" id="Pregunta-2" v-model="filename" value="Pregunta-2" class="mx-1">
          <label for="Pregunta-2" class="mx-2">Pregunta 2</label>
        </div>
        <div>
          <input type="radio" id="Pregunta-3" v-model="filename" value="Pregunta-3" class="mx-1">
          <label for="Pregunta-3" class="mx-2">Pregunta 3</label>
        </div>
        <div>
          <input type="radio" id="Pregunta-4" v-model="filename" value="Pregunta-4" class="mx-1">
          <label for="Pregunta-4" class="mx-2">Pregunta 4</label>
        </div>
        <div>
          <input type="radio" id="custom-filename" v-model="filename" value="" class="mx-1">
          <label for="custom-filename" class="mx-2">Otro</label>
        </div>

        <div v-if="customFilenameSelected">
          <input type="text" v-model="filename" class="border-2 border-blue-400 p-2 mt-3 rounded-md w-full" placeholder="Nombre del archivo">
        </div>
      </div>
    <div class="flex flex-col items-center md:grid md:grid-cols-4 gap-x-4">
      <div v-for="i in numberOfAttachments" :key="i" class="mb-6">
        <label
          :for="`file-field-${i}`"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          <div v-if="images[i-1]">
            <div class="w-64 h-96 bg-cover bg-center rounded-md p-0.5" :style="{ backgroundImage: `url(${images[i-1]})` }">
              <div class="flex justify-center items-center w-8 h-8 bg-red-500 rounded-2xl">
                <button @click="removeImage(i-1)" class="text-white text-xl font-bold">X</button>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="flex flex-col items-center justify-center w-64 h-96 bg-gray-200 rounded-md">
              <i class="fas fa-file-upload text-4xl text-gray-400"></i>
              <span class="text-gray-600 text-2xl p-2"> Añadir imagen </span>
            </div>
          </div>
        </label>
        <input
          type="file"
          :id="`file-field-${i}`"
          @change="onFileChange($event, i-1)"
          accept="image/jpg"
          capture="environment"
          class="hidden"
        />
      </div>
    </div>
      <div class="flex flex-row items-center space-x-5">
        <button type="button" @click="numberOfAttachments = numberOfAttachments + 1" class="p-2 text-white bg-blue-600 hover:bg-blue-800 rounded-lg">
          Añadir más archivos
        </button>
        <button type="button" @click="submit" class="p-2 text-white bg-blue-600 hover:bg-blue-800 rounded-lg" :class="{'opacity-50': isAnyInputRendering}" :disabled="isAnyInputRendering">
          Generar PDF
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