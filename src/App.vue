<script setup lang='ts'>
  import { jsPDF } from 'jspdf';
  import { ref, computed } from 'vue';
  import * as imageConversion from 'image-conversion';

  const images = ref<string[]>([]);
  const inputRendering = ref<boolean[]>([false]);
  const numberOfAttachments = ref(1);
  const isGenerating = ref(false);
  const fieldDraggedOver = ref(-1);

  const filename = ref('');

  const isAnyInputRendering = computed(() => {
    return inputRendering.value.some(x => x);
  });

  const isSummitDisabled = computed(() => {
    return isAnyInputRendering.value || isGenerating.value;
  });

  const computedFilename = computed(() => {
    return filename.value.length > 0 ? filename.value + '.pdf' : 'scan.pdf';
  }
  );

  function removeImage(index: number) {
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
      doc.text('Page ' + (index + 1), 200, 2);
      doc.addImage(image, 'JPEG', 3.5, 3.5, 203, 290, alias, 'SLOW');

      if (index === images.value.length - 1) {
        doc.save(computedFilename.value);
      } else {
        doc.addPage();
      }
    });
  }

  async function onFileChange(event: Event, index: number) {
    if (event.target === null) {
      return;
    }

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

  function dragover(index: number, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    fieldDraggedOver.value = index;
  }

  function dragleave(index: number, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    fieldDraggedOver.value = -1;
  }

  function drop(index: number, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer!.files[0];
    const input = document.getElementById(`file-field-${index}`) as HTMLInputElement;

    input.files = event.dataTransfer!.files;
    input.dispatchEvent(new Event('change'));

    fieldDraggedOver.value = -1;
  }
</script>

<template>
<input type="checkbox" id="help-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative">
    <label for="help-modal" class="btn btn-sm absolute right-2 top-2">✕</label>
    <h3 class="text-lg font-bold">Como usar</h3>
    <p class="py-4">Puedes usar scan.cparedesr.com en simples 4 pasos</p>
    <ul class="steps steps-vertical">
      <li class="step step-primary">Apretar en añadir imagen</li>
      <li class="step step-primary">Saca una foto o agrega una imagen</li>
      <li class="step step-primary">Añade más archivos y repetir</li>
      <li class="step step-primary">Asigna un nombre al archivo</li>
      <li class="step step-primary">Genera tu PDF!</li>
    </ul>
  </div>
</div>
  <label for="help-modal" class="btn btn-sm absolute right-4 top-4">
        ¿Cómo usar?
  </label>
  <div class="flex flex-col space-y-4 px-4 py-4 md:px-32 min-h-screen bg-gradient-to-r from-primary to-secondary">
    <div class="card bg-base-100 shadow-xl md:p-8 p-3 my-auto w-full">
      <div class="flex flex-col rounded-md mb-6 justify-center items-center md:items-start">
        <h2 class="text-xl md:text-2xl font-semibold mb-4"> Selecciona un nombre para el archivo </h2>
        <div class="form-control w-full">
          <label class="input-group w-full">
            <input type="text"  v-model="filename" placeholder="SCAN" class="input input-bordered input-primary  w-full" />
            <span>.pdf</span>
          </label>
        </div>
      </div>
    <div class="flex flex-col items-center md:grid md:grid-cols-5 gap-x-2">
      <div
        v-for="i in numberOfAttachments"
        :key="i"
        class="mb-6"
        @dragover="dragover(i, $event)"
        @dragleave="dragleave(i, $event)"
        @drop="drop(i, $event)"
        >
        <label
          :for="`file-field-${i}`"
          class="block text-base-900 text-sm font-bold"
        >
          <div v-if="images[i-1]">
            <div class="w-64 h-96 bg-cover bg-center rounded-md shadow-lg p-0.5" :style="{ backgroundImage: `url(${images[i-1]})` }">
              <button @click="removeImage(i-1)" class="btn btn-error text-white text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div v-else>
            <div class="shadow-lg flex flex-col items-center justify-center w-64 h-96 bg-base-300 rounded-md">
              <i class="fas fa-file-upload text-4xl text-base-900"></i>
              <span class="text-base-600 text-2xl p-2 text-center">
                {{ fieldDraggedOver === i ? 'Suelta la imagen aquí' : 'Añadir imagen' }}
              </span>
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
      <div class="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-x-5 md:space-y-0">
        <div class="w-full">
          <button type="button" @click="numberOfAttachments = numberOfAttachments + 1" class="btn btn-secondary btn-block">
            Añadir más archivos
          </button>
        </div>
        <div class="w-full">
          <button type="button" @click="submit" class="btn btn-primary btn-block" :class="{ 'loading': isSummitDisabled }" :disabled="isSummitDisabled">
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>