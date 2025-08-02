// Footer functionality
export function initFooter() {
  const levelsLink = document.getElementById('levels-link');
  const levelsExplanation = document.getElementById('levels-explanation');
  
  if (levelsLink && levelsExplanation) {
    levelsLink.addEventListener('click', (e) => {
      e.preventDefault();
      const isVisible = levelsExplanation.style.display !== 'none';
      levelsExplanation.style.display = isVisible ? 'none' : 'block';
    });
  }
}