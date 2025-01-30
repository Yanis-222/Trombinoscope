const skillColors = {
    "bootstrap": "blue",
    "html5": "red",
    "symfony": "yellow",
    "css3": "blue",
    "javascript": "green",
    "vue.js": "green",
    "figma": "pink",
    "php": "yellow",
    "c#": "purple",
    "tailwind": "blue"
};

document.addEventListener('DOMContentLoaded', (event) => {
    const apprenantsContainer = document.getElementById('apprenants-container');

    fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions')
        .then(response => response.json())
        .then(promotions => {
            const promotionMap = {};
            promotions.forEach(promotion => {
                promotionMap[promotion.id] = promotion.name;
            });

            fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/competences')
                .then(response => response.json())
                .then(competences => {
                    const competencesMap = {};
                    competences.forEach(competence => {
                        competencesMap[competence.id] = competence.name;
                    });

                    fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')
                        .then(response => response.json())
                        .then(apprenants => {
                            apprenants.forEach(apprenant => {
                                const promotionId = apprenant.promotions[0];
                                const promotionName = promotionMap[promotionId] || 'Unknown';

                                const competencesElements = apprenant.competences.map(skillId => {
                                    const skillName = competencesMap[skillId] || 'Unknown';
                                    const colorClass = skillColors[skillName.toLowerCase()] || 'gray';
                                    return `<span class="skill ${colorClass}">${skillName}</span>`;
                                });

                                const card = document.createElement('div');
                                card.className = 'card';
                                card.setAttribute('onclick', 'flipCard(this)');

                                card.innerHTML = `
                                    <div class="card-inner">
                                        <div class="card-front">
                                            <h2 class="name">${apprenant.title.rendered}</h2>
                                            <div class="container-image"><img class="profilePic" src="${apprenant.image}"></div>
                                            <p class="promo">Promotion: ${promotionName}</p>
                                            <div class = "container-skill"><p class="skills">${competencesElements.join('')}</p></div>
                                            <div class="links">
                                                <a href="${apprenant.urlgit}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoGithub.svg"></a>
                                                <a href="${apprenant.linkedin}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoLinkedin.svg"></a>
                                                <a href="${apprenant.cv}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoCV.svg"></a>
                                                <a href="${apprenant.portfolio}" target="_blank" onclick="event.stopPropagation();">
                                                <img src="assets/icones/logoPortfolio.svg"></a>
                                            </div>
                                        </div>
                                        <div class="card-back">
                                            <p class="excerpt">${apprenant.excerpt.rendered}</p>
                                        </div>
                                    </div>
                                `;

                                apprenantsContainer.appendChild(card);
                            });
                        })
                        .catch(error => console.error('Erreur:', error));
                })
                .catch(error => console.error('Erreur:', error));
        })
        .catch(error => console.error('Erreur:', error));
});



function flipCard(card) {
    card.classList.toggle('flipped');
}
