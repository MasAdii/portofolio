document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Section: Typing Effect ---
    const taglineElement = document.querySelector('.tagline');
    const taglineText = "Exploit. Build. Repeat.";
    let charIndex = 0;
    let isDeleting = false;
    let delay = 150; // Waktu tunggu antara setiap karakter

    function typeEffect() {
        const currentText = taglineText.substring(0, charIndex);
        taglineElement.textContent = currentText;

        if (!isDeleting && charIndex < taglineText.length) {
            charIndex++;
            delay = 150;
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            delay = 70;
        }

        if (charIndex === taglineText.length && !isDeleting) {
            // Tunggu sebentar sebelum mulai menghapus
            delay = 1800; // Slightly longer pause
            isDeleting = true;
        } else if (charIndex === 0 && isDeleting) {
            // Tunggu sebentar sebelum mulai mengetik lagi
            delay = 1000; // Slightly longer pause
            isDeleting = false;
        }

        setTimeout(typeEffect, delay);
    }
    typeEffect();

    // --- Hero Section: Scroll Buttons ---
    document.querySelector('.hero-buttons .primary-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
    });

    document.querySelector('.hero-buttons .secondary-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#terminal-section').scrollIntoView({ behavior: 'smooth' });
        // Fokuskan input terminal setelah scroll
        setTimeout(() => {
            document.getElementById('terminal-input').focus();
        }, 800); // Give time for smooth scroll
    });

    // --- Project Showcase: Render Projects & Filtering ---
    const projectGrid = document.getElementById('project-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    function renderProjects(filter = 'all') {
        projectGrid.innerHTML = ''; // Clear current projects

        const filteredProjects = projectsData.filter(project => {
            return filter === 'all' || project.type === filter;
        });

        if (filteredProjects.length === 0) {
            projectGrid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--border-color); padding: 50px 0;">Belum ada proyek untuk filter ini.</p>';
            return;
        }

        filteredProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');
            // Add a class for reveal if wanted, e.g., 'reveal-item'
            // projectCard.classList.add('reveal-item');
            projectCard.innerHTML = `
                <h3>${project.title}</h3>
                <p class="language">${project.language}</p>
                <p>${project.description}</p>
                <div class="project-links">
                    <a href="${project.github}" target="_blank">Lihat GitHub</a>
                </div>
            `;
            projectGrid.appendChild(projectCard);
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProjects(button.dataset.filter);
        });
    });

    // Initial render of all projects
    renderProjects('all');

    // --- Terminal Section: Interactive Terminal ---
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');

    const terminalCommands = {
        help: `
            Daftar Perintah:
             - help: Menampilkan daftar perintah.
             - about: Informasi singkat tentang MasAdi.
             - projects: Menampilkan proyek-proyek terbaru.
             - quote: Menampilkan kutipan acak.
             - clear: Membersihkan layar terminal.
        `,
        about: `
            MasAdi adalah seorang developer & pentester independen. Berfokus pada pembangunan alat, eksplorasi sistem, dan pembelajaran berkelanjutan di dunia siber.
            "Misteri adalah bagian dari proses, bukan penghalang."
        `,
        projects: `
            Proyek-proyek terbaru:
            ${projectsData.slice(0, 3).map(p => ` - ${p.title} (${p.language})`).join('\n')}
            Kunjungi bagian Proyek untuk daftar lengkap.
        `,
        quote: () => {
            const randomIndex = Math.floor(Math.random() * quotesData.length);
            const quote = quotesData[randomIndex];
            return `"${quote.quote}"\n   -- ${quote.author}`;
        }
    };

    function addLineToTerminal(text, isError = false) {
        const lines = text.split('\n'); // Split text by new line for separate typing effect
        let lineIndex = 0;

        function typeNextLine() {
            if (lineIndex < lines.length) {
                const lineDiv = document.createElement('div');
                lineDiv.classList.add('line');
                if (isError) {
                    lineDiv.classList.add('error');
                }
                terminalOutput.appendChild(lineDiv);

                let charCurrentIndex = 0;
                const typingInterval = setInterval(() => {
                    if (charCurrentIndex < lines[lineIndex].length) {
                        lineDiv.textContent += lines[lineIndex].charAt(charCurrentIndex);
                        charCurrentIndex++;
                        terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll
                    } else {
                        clearInterval(typingInterval);
                        lineIndex++;
                        // Add a slight delay before typing the next line
                        if (lineIndex < lines.length) {
                            setTimeout(typeNextLine, 50); // Small delay between lines
                        }
                    }
                }, 15); // Kecepatan typing per karakter
            }
        }
        typeNextLine();
    }


    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            addLineToTerminal(`masadi@kali:~$ ${command}`);
            terminalInput.value = ''; // Clear input

            setTimeout(() => { // Add a small delay for response to appear after command
                if (terminalCommands[command]) {
                    if (typeof terminalCommands[command] === 'function') {
                        addLineToTerminal(terminalCommands[command]());
                    } else {
                        addLineToTerminal(terminalCommands[command]);
                    }
                } else if (command === 'clear') {
                    terminalOutput.innerHTML = '';
                    addLineToTerminal('Terminal dibersihkan.');
                } else {
                    addLineToTerminal(`Perintah tidak ditemukan: '${command}'. Ketik 'help' untuk daftar perintah.`, true);
                }
            }, 300); // Delay before response appears
        }
    });

    // --- Scroll Reveal Animation (Intersection Observer) ---
    // Target sections and other specific elements like skill-groups, terminal window etc.
    const elementsToReveal = document.querySelectorAll('.section, .skill-group, .terminal-window, .about-content, .quotes-carousel, .contact-content, .project-card');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the element must be visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    elementsToReveal.forEach(element => {
        sectionObserver.observe(element);
    });

    // --- Quotes Section: Simple Carousel/Random Display ---
    const quotesCarousel = document.getElementById('quotes-carousel');
    let currentQuoteIndex = 0;

    function showQuote(index) {
        // Create new quote element, apply animation, then remove old one
        const oldQuoteItem = quotesCarousel.querySelector('.quote-item.active');
        if (oldQuoteItem) {
            oldQuoteItem.classList.remove('active');
            oldQuoteItem.style.opacity = '0';
            oldQuoteItem.style.transform = 'translateY(-20px)';
            // Remove after transition
            setTimeout(() => oldQuoteItem.remove(), 800);
        }

        const quoteItem = document.createElement('div');
        quoteItem.classList.add('quote-item');
        quoteItem.innerHTML = `
            "${quotesData[index].quote}"
            <span class="quote-author">-- ${quotesData[index].author}</span>
        `;
        quotesCarousel.appendChild(quoteItem);

        // Force reflow for animation to trigger
        void quoteItem.offsetWidth;
        quoteItem.classList.add('active');
    }

    function rotateQuotes() {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotesData.length;
        showQuote(currentQuoteIndex);
    }

    // Initial display
    if (quotesData.length > 0) {
        showQuote(0);
        setInterval(rotateQuotes, 7000); // Change quote every 7 seconds
    }
});
