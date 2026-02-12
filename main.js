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
    const FINNHUB_API_KEY = 'd66it1hr01qnh6seg4ngd66it1hr01qnh6seg4o0'; // User provided Finnhub API Key
    const portfolioContainer = document.getElementById('portfolio-items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-container');
    let itemId = 0;

    // Async function to fetch dividend yield from Finnhub
    async function getFinnhubDividendYield(stockSymbol) {
        if (!stockSymbol) return null;

        try {
            // Step 1: Get current price
            const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${FINNHUB_API_KEY}`);
            const quoteData = await quoteResponse.json();
            const currentPrice = quoteData.c; // 'c' is current price

            if (currentPrice === 0) { // If current price is 0, stock might not be found or data unavailable
                console.warn(`No current price found for ${stockSymbol}`);
                return null;
            }

            // Step 2: Get dividend history for the last 15 months to calculate annual dividend
            const now = new Date();
            const fifteenMonthsAgo = new Date(now.setMonth(now.getMonth() - 15));
            const from = Math.floor(fifteenMonthsAgo.getTime() / 1000); // Unix timestamp
            const to = Math.floor(Date.now() / 1000); // Unix timestamp

            const dividendResponse = await fetch(`https://finnhub.io/api/v1/stock/dividend?symbol=${stockSymbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`);
            const dividendData = await dividendResponse.json();

            let annualDividend = 0;
            // Sum dividends from the last 12 months (approximate)
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
            
            if (dividendData && dividendData.data) {
                dividendData.data.forEach(div => {
                    const exDate = new Date(div.exDate * 1000); // Convert Unix timestamp to Date
                    if (exDate >= twelveMonthsAgo) {
                        annualDividend += div.amount;
                    }
                });
            }

            if (annualDividend === 0) {
                console.warn(`No annual dividend found for ${stockSymbol} in the last 12 months.`);
                return null;
            }

            // Step 3: Calculate dividend yield
            const dividendYield = (annualDividend / currentPrice) * 100;
            return dividendYield.toFixed(2); // Return as percentage with 2 decimal places

        } catch (error) {
            console.error('Error fetching Finnhub data:', error);
            return null;
        }
    }

    // Function to create a new portfolio item row
    const createPortfolioItem = () => {
        itemId++;
        const itemHtml = `
            <div class="portfolio-item row g-3 align-items-center mb-3 p-3 border rounded" id="item-${itemId}">
                <div class="col-md-3">
                    <label class="form-label">종목명 (티커 심볼)</label>
                    <input type="text" class="form-control stock-name-input" placeholder="예: AAPL" value="">
                </div>
                <div class="col-md-3">
                    <label class="form-label">투자 원금 (원)</label>
                    <input type="number" class="form-control principal-input" placeholder="1000000" value="1000000">
                </div>
                <div class="col-md-2">
                    <label class="form-label">수익률 (%)</label>
                    <input type="number" class="form-control return-rate-input" placeholder="8" value="8">
                </div>
                <div class="col-md-2">
                    <label class="form-label">배당률 (%)</label>
                    <input type="number" class="form-control dividend-rate-input" placeholder="0.00" value="0.00" readonly>
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
            const newItem = portfolioContainer.lastElementChild;
            const stockNameInput = newItem.querySelector('.stock-name-input');
            const dividendRateInput = newItem.querySelector('.dividend-rate-input');

            // Event listener for automatic dividend yield lookup
            stockNameInput.addEventListener('blur', async function() {
                const stockSymbol = this.value.trim().toUpperCase();
                if (stockSymbol) {
                    dividendRateInput.value = '조회 중...';
                    const yieldValue = await getFinnhubDividendYield(stockSymbol);
                    if (yieldValue !== null) {
                        dividendRateInput.value = yieldValue;
                    } else {
                        dividendRateInput.value = '0.00'; // Reset if not found
                        alert(`'${stockSymbol}'에 대한 배당률 정보를 찾을 수 없습니다. 티커 심볼을 확인하거나 수동으로 입력해주세요.`);
                    }
                } else {
                    dividendRateInput.value = '0.00';
                }
            });
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
                const principal = parseFloat(item.querySelector('.principal-input').value) || 0;
                const returnRate = parseFloat(item.querySelector('.return-rate-input').value) || 0;
                const dividendRate = parseFloat(item.querySelector('.dividend-rate-input').value) || 0;

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