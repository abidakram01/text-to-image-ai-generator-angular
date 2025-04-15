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
    { name: 'FLUX Dev Model', value: 'black-forest-labs/FLUX.1-dev' },
    { name: 'Schnell Model', value: 'black-forest-labs/FLUX.1-schnell' },
    { name: 'Stable Diffusion Model', value: 'stabilityai/stable-diffusion-xl-base-1.0' }
  ];

  constructor(private imageService: ImageService) { } // Injects ImageService for generating images

  // Sample prompts that users can randomly select from
  examplePrompts = [
    "A desert oasis at twilight with bioluminescent plants and crystal-clear waters",
    "A forgotten sky temple floating among the stars with ancient glowing runes",
    "A mystical train station where portals open to different worlds",
    "A snowy village built inside a giant tree with lanterns hanging from branches",
    "A moonlit tea party with ghosts, owls, and enchanted teapots in a haunted garden",
    "A deep jungle temple overgrown with nature and guarded by stone animal spirits",
    "A futuristic underwater subway system with glass tunnels and glowing fish",
    "A mountaintop observatory powered by lightning and floating crystals",
    "A fantasy market on the back of a flying whale drifting through the skies",
    "A neon-lit forest where trees react to music and dance with light",
    "A dreamscape city where gravity shifts and buildings float in mid-air",
    "An ancient dragon graveyard turned into a peaceful sanctuary with cherry trees",
    "A lighthouse on a floating rock guiding skyships through a starlit storm",
    "A magical bakery where pastries float, and ingredients glow with spells",
    "An interdimensional bazaar with merchants from different galaxies",
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