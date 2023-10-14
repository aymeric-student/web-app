<template>
  <div>
    <form @submit.prevent="uploadFile">
      <input type="file" ref="fileInput" />
      <button type="submit">Envoyer</button>
    </form>
    <p v-if="message">{{ message }}</p>

    <button @click="getFile('VotreNomDeFichier.extension')">Télécharger le fichier</button>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';

const fileInput: Ref<HTMLInputElement | null> = ref(null);
const message = ref('');

const uploadFile = async () => {
  const file = fileInput.value?.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('upload', file);

  try {
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    message.value = data.message;

    if (!data.success) {
      console.log("Erreur lors de l'upload");
    }
  } catch (error) {
    console.error('Erreur:', error);
    message.value = "Une erreur est survenue lors de l'envoi du fichier.";
  }
};

const getFile = async (filename: string) => {
  try {
    console.log('filename', filename);
    const response = await fetch(`http://localhost:3001/getFile/pdf-test-vue.pdf`);
    const data = await response.json();

    if (data.url) {
      window.open(data.url, '_blank');
    } else {
      console.log("Erreur lors de la récupération de l'URL du fichier");
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier:', error);
  }
};
</script>
