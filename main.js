document.addEventListener('DOMContentLoaded', function () {

    // --- Smooth scrolling for navigation links ---
    const navLinks = document.querySelectorAll('.nav-link');
    for (const link of navLinks) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            // Close the navbar on mobile after clicking a link
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navbarCollapse, { toggle: false }).hide();
            }
        });
    }

    // --- Original Contact Form Logic (can be kept or removed, doesn't interfere) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formFeedback = document.getElementById('form-feedback');
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (name && email && message) {
                formFeedback.innerHTML = '<div class="alert alert-success" role="alert">메시지가 성공적으로 전송되었습니다. 곧 연락드리겠습니다!</div>';
                contactForm.reset();
            } else {
                formFeedback.innerHTML = '<div class="alert alert-danger" role="alert">모든 필드를 입력해주세요.</div>';
            }
            setTimeout(() => { formFeedback.innerHTML = ''; }, 5000);
        });
    }


    // --- NEW: Portfolio Calculator Logic ---
    const portfolioContainer = document.getElementById('portfolio-items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-container');
    let itemId = 0;

    // Function to create a new portfolio item row
    const createPortfolioItem = () => {
        itemId++;
        const itemHtml = `
            <div class="portfolio-item row g-3 align-items-center mb-3 p-3 border rounded" id="item-${itemId}">
                <div class="col-md-3">
                    <label class="form-label">종목명</label>
                    <input type="text" class="form-control" placeholder="예: 삼성전자" value="종목 ${itemId}">
                </div>
                <div class="col-md-3">
                    <label class="form-label">투자 원금 (원)</label>
                    <input type="number" class="form-control" placeholder="1000000" value="1000000">
                </div>
                <div class="col-md-2">
                    <label class="form-label">수익률 (%)</label>
                    <input type="number" class="form-control" placeholder="8" value="8">
                </div>
                <div class="col-md-2">
                    <label class="form-label">배당률 (%)</label>
                    <input type="number" class="form-control" placeholder="2" value="2">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-danger remove-item-btn w-100">
                        <i class="bi bi-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
        if (portfolioContainer) {
            portfolioContainer.insertAdjacentHTML('beforeend', itemHtml);
        }
    };

    // Add item button event
    if(addItemBtn) {
        addItemBtn.addEventListener('click', createPortfolioItem);
    }
    

    // Remove item button event (using event delegation)
    if(portfolioContainer){
        portfolioContainer.addEventListener('click', function(e) {
            if (e.target && e.target.closest('.remove-item-btn')) {
                e.target.closest('.portfolio-item').remove();
            }
        });
    }


    // Calculate button event
    if(calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            const items = portfolioContainer.querySelectorAll('.portfolio-item');
            let totalPrincipal = 0;
            let totalEarnings = 0;
            let totalDividends = 0;

            items.forEach(item => {
                const principal = parseFloat(item.querySelectorAll('input')[1].value) || 0;
                const returnRate = parseFloat(item.querySelectorAll('input')[2].value) || 0;
                const dividendRate = parseFloat(item.querySelectorAll('input')[3].value) || 0;

                totalPrincipal += principal;
                totalEarnings += principal * (returnRate / 100);
                totalDividends += principal * (dividendRate / 100);
            });
            
            const totalValue = totalPrincipal + totalEarnings + totalDividends;

            const resultsHtml = `
                <div class="card">
                    <div class="card-header">
                        <h4>계산 결과</h4>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <strong>총 투자 원금</strong>
                                <span>${totalPrincipal.toLocaleString()} 원</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <strong>총 예상 수익 (세전)</strong>
                                <span class="text-success">+${totalEarnings.toLocaleString()} 원</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <strong>총 예상 배당 (세전)</strong>
                                <span class="text-primary">+${totalDividends.toLocaleString()} 원</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center fs-5">
                                <strong>총 예상 평가 금액</strong>
                                <strong>${totalValue.toLocaleString()} 원</strong>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML = resultsHtml;
        });
    }

    // Initialize with one item
    if(portfolioContainer) {
       createPortfolioItem();
    }
});