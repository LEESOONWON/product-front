document.addEventListener('DOMContentLoaded', function () {

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    for (const link of navLinks) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // For internal links
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            } else {
                // For external links
                window.location.href = targetId;
            }

            // Close the navbar on mobile after clicking a link
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    }

    // Contact form submission feedback
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault(); 

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (name && email && message) {
            // In a real application, you would send this data to a server.
            // For this prototype, we'll just show a success message.
            formFeedback.innerHTML = '<div class="alert alert-success" role="alert">메시지가 성공적으로 전송되었습니다. 곧 연락드리겠습니다!</div>';
            contactForm.reset();
        } else {
            formFeedback.innerHTML = '<div class="alert alert-danger" role="alert">모든 필드를 입력해주세요.</div>';
        }

        // Remove feedback message after a few seconds
        setTimeout(() => {
            formFeedback.innerHTML = '';
        }, 5000);
    });

});
