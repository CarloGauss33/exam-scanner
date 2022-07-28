<script setup lang="ts">
  import { jsPDF } from "jspdf";
  import { ref } from "vue";

  const images = ref<string[]>([]);
  const numberOfAttachments = ref(1);
  const isGenerating = ref(false);

  function submit() {
    isGenerating.value = true;
    generatePDF();
  }

  function generatePDF() {
    isGenerating.value = true;
    const doc = new jsPDF('p', 'mm','a4', true);
    var canvas = document.createElement("canvas") as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    var img = new Image();

    images.value.forEach((image, index) => {
      const alias = `image${index}`;
      img.src = image;
      img.onload = () => {
        doc.setFontSize(7);
        doc.text("Page " + (index + 1), 200, 2);
        canvas.width = img.width;
        canvas.height = img.height;
        context?.drawImage(img, 0, 0);
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 3.5, 3.5, 203, 290, alias, "SLOW");
        if (index < images.value.length - 1) {
          doc.addPage();
        }
      };
    });
    setTimeout(() => {
      doc.save('test.pdf');
    }, 2000);
    isGenerating.value = false;
  }

  function onFileChange(event: Event, index: number) {
    event.preventDefault();
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        images.value[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<template>
  <div class="flex flex-col space-y-4 md:p-24 p-4 bg-white min-h-screen w-screen">
    <form @submit.prevent="submit" class="bg-slate-300 md:p-8 p-3 rounded-md w-full">
      <div v-for="i in numberOfAttachments" :key="i" class="mb-6">
        <input type="file" :id="`file-field-${i}`" @change="onFileChange($event, i-1)" accept="image/jpg" capture="environment" class="mb-0.5">
      </div>
      <div class="flex flex-row items-center space-x-5">
        <button type="button" @click="numberOfAttachments = numberOfAttachments + 1" class="p-1 bg-gray-400 hover:bg-gray-500 rounded-md">
          Add file
        </button>
        <button type="submit" class="p-1 bg-gray-400 hover:bg-gray-500 rounded-lg">Generate PDF</button>
      </div>
      <div v-if="isGenerating">
        <p class="text-center">Generating PDF...</p>
      </div>
    </form>
  </div>
</template>