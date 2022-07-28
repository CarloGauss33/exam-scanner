<script setup lang="ts">
  import { jsPDF } from "jspdf";
  import { ref } from "vue";
  import exif from 'exif-js';

  const images = ref<string[]>([]);
  const numberOfAttachments = ref(1);

  function generatePDF() {
    const doc = new jsPDF('p', 'mm','a4', true);
    images.value.forEach((image, index) => {
      const alias = `image${index}`;
      const imageData = new Image();
      imageData.src = image;
      const isPortrait = imageData.height > imageData.width;
      if (isPortrait) {
        doc.addImage(imageData, 'JPEG', 0, 0, 210, 297);
      } else {
        doc.addImage(image, "JPEG", 0, -210, 297, 210, alias, 'NONE', 270);
      }
      if (index < numberOfAttachments.value - 1) {
        doc.addPage();
      }
    });
    doc.save("test.pdf");
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
  <div class="flex flex-col">
    <form @submit.prevent="generatePDF">
      <div v-for="i in numberOfAttachments" :key="i">
        <input type="file" :id="`file-field-${i}`" @change="onFileChange($event, i-1)" accept="image/*" capture="environment">
      </div>
      <button type="button" @click="numberOfAttachments = numberOfAttachments + 1" class="btn btn-primary">
        Add file
      </button>
      <br/>
      <button type="submit" class="btn btn-primary">Generate PDF</button>
    </form>
  </div>
</template>