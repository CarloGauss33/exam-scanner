<script setup lang="ts">
  import { jsPDF } from "jspdf";
  import { ref } from "vue";

  const images = ref<string[]>([]);
  const numberOfAttachments = ref(1);

  function generatePDF() {
    const doc = new jsPDF('p', 'mm','a4',true);
    images.value.forEach((image, index) => {
      doc.addImage(image, "JPEG", 0, 0, 210, 297);
      if (index < numberOfAttachments.value - 1) {
        doc.addPage();
      }
    });
    doc.save("test.pdf");
  }

  function onFileChange(event: Event) {
    // add file to images array
    event.preventDefault();
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      console.log(files);
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          images.value.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }
</script>

<template>
  <div class="flex flex-col">
    <form @submit.prevent="generatePDF">
      <div v-for="i in numberOfAttachments" :key="i">
        <input type="file" :id="`file-field-${i}`" @change="onFileChange" accept="image/*" />
      </div>
      <button type="button" @click="numberOfAttachments = numberOfAttachments + 1" class="btn btn-primary">
        Add file
      </button>
      <br/>
      <button type="submit" class="btn btn-primary">Generate PDF</button>
    </form>

  </div>
</template>