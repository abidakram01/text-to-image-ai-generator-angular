import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImageService } from './image.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'text-to-image-generator-angular';

  // Form input values
  promptText = ''; // Text prompt entered by user
  selectedModel = ''; // Selected model ID from dropdown
  imageCount = ''; // Number of images to generate (input as string)
  aspectRatio = ''; // Selected aspect ratio (like 1:1, 16:9, etc.)

  isLoading = false; // Indicates if image generation is in progress
  isDarkTheme = false; // Tracks current theme (dark/light)

  // Array of generated image objects with status
  generatedImages: { loading: boolean; error: boolean; url: string; filename: string }[] = [];

  // Available models for image generation
  models = [
    { name: 'FLUX AI', value: 'black-forest-labs/FLUX.1-dev' },
    { name: 'Schnell AI', value: 'black-forest-labs/FLUX.1-schnell' },
  ];

  constructor(private imageService: ImageService) { } // Injects ImageService for generating images

  // Sample prompts that users can randomly select from
  examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
  ];

  // Runs when component initializes
  ngOnInit() {
    const savedTheme = localStorage.getItem('theme'); // Retrieves saved theme from local storage
    // Checks system preference or uses saved theme
    this.isDarkTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('dark-theme', this.isDarkTheme); // Applies theme to body
  }

  // Toggles between dark and light theme
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Saves preference
    document.body.classList.toggle('dark-theme', this.isDarkTheme); // Updates class on body
  }

  // Randomly picks one of the example prompts
  fillRandomPrompt() {
    this.promptText = this.examplePrompts[Math.floor(Math.random() * this.examplePrompts.length)];
  }

  // Handles image generation when form is submitted
  async handleFormSubmit() {
    // Get dimensions based on selected aspect ratio
    const { width, height } = this.imageService.getImageDimensions(this.aspectRatio);

    // Generate API endpoint for the selected model
    const modelUrl = `https://router.huggingface.co/hf-inference/models/${this.selectedModel}`;

    this.isLoading = true; // Set loading to true while API call is in progress

    // Convert imageCount to number safely
    const imageCount = Number(this.imageCount) || 0;

    // Initialize empty placeholders for generated images
    this.generatedImages = Array.from({ length: imageCount }).map(() => ({
      loading: true,
      error: false,
      url: '',
      filename: ''
    }));

    // Generate all images concurrently
    await Promise.allSettled(
      this.generatedImages.map(async (_, i) => {
        try {
          const blob = await this.imageService.generateImage(modelUrl, this.promptText, width, height); // Fetch generated image
          const url = URL.createObjectURL(blob); // Create URL for image blob
          this.generatedImages[i] = {
            loading: false,
            error: false,
            url,
            filename: `${Date.now()}_${i}.png` // Unique filename
          };
        } catch {
          // Handle error if image fails to generate
          this.generatedImages[i] = {
            loading: false,
            error: true,
            url: '',
            filename: ''
          };
        }
      })
    );

    this.isLoading = false; // Turn off loading spinner
  }
}