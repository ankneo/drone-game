# Drone Pilot 🚁

A physics-based 2D drone navigation game built with Next.js, React, and HTML5 Canvas. Navigate your drone through challenging obstacle courses, manage your fuel, collect powerups, and earn credits to upgrade your ship!

## 🎮 Play the Game
Play it live here: [https://ankneo.github.io/drone-game](https://ankneo.github.io/drone-game)

## ✨ Features
* **Physics Engine**: Realistic gravity, thrust, friction, and wind mechanics.
* **19 Unique Levels**: Ranging from simple flights to complex gauntlets with lasers, magnets, and searchlights.
* **Endless Mode**: Test your skills in the final "Endless Void" level.
* **Dynamic Obstacles**: Moving barriers, homing missiles, wind tunnels, and magnetic fields.
* **Powerups**: Collect fuel, shields, and slow-motion powerups to survive.
* **Shop & Upgrades**: Earn credits based on time, fuel efficiency, and accuracy to buy:
  * Engine Upgrades (more thrust)
  * Extended Battery (more fuel capacity)
  * Hull Armor (absorb collisions)
  * Fuel Magnet (attract powerups)
* **Cosmetic Skins**: Unlock and equip different drone skins like "Crimson Fury", "Neon Strike", and "Void Walker".

## ⌨️ Controls
* **W / Up Arrow**: Thrust Up
* **A / Left Arrow**: Thrust Left
* **S / Down Arrow**: Thrust Down
* **D / Right Arrow**: Thrust Right
* **Spacebar**: EMP Pulse (Destroys nearby missiles and barriers, has a cooldown)

## 🚀 Deployment (GitHub Pages)

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions:
1. Push this code to the `main` branch of your repository named `drone-game`.
2. Go to your repository on GitHub.
3. Navigate to **Settings** > **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. The workflow in `.github/workflows/deploy.yml` will automatically build and deploy the game to `https://ankneo.github.io/drone-game`.

*(Note: If you rename the repository, make sure to update the `basePath` in `next.config.github.ts` to match your new repository name).*

## 🛠️ Tech Stack
* Next.js (App Router)
* React
* HTML5 Canvas API
* Tailwind CSS
* Web Audio API (for sound effects)
