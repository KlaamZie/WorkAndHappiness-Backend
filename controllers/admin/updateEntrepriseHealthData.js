async function updateEntrepriseHealthData(entreprise) {

    // On update healthData pour stocker les données du mois
    entreprise.healthData.general = (entreprise.monthlyData.general / entreprise.monthlyData.divider).toFixed(1);

    if (entreprise.monthlyData.dividerGroup1 !== 0) {
        entreprise.healthData.group1 = (entreprise.monthlyData.group1 / entreprise.monthlyData.dividerGroup1).toFixed(1);
    } else {
        entreprise.healthData.group1 = 0;
    }

    if (entreprise.monthlyData.dividerGroup2 !== 0) {
        entreprise.healthData.group2 = (entreprise.monthlyData.group2 / entreprise.monthlyData.dividerGroup2).toFixed(1);
    } else {
        entreprise.healthData.group2 = 0;
    }

    if (entreprise.monthlyData.dividerGroup3 !== 0) {
        entreprise.healthData.group3 = (entreprise.monthlyData.group3 / entreprise.monthlyData.dividerGroup3).toFixed(1);
    } else {
        entreprise.healthData.group3 = 0;
    }

    // On clear le monthly data pour pouvoir accueillir les données du mois suivant
    entreprise.monthlyData.divider = 0;
    entreprise.monthlyData.dividerGroup1 = 0;
    entreprise.monthlyData.dividerGroup2 = 0;
    entreprise.monthlyData.dividerGroup3 = 0;
    entreprise.monthlyData.general = 0;
    entreprise.monthlyData.group1 = 0;
    entreprise.monthlyData.group2 = 0;
    entreprise.monthlyData.group3 = 0;

    // On archive la première valeur du tableau (la plus ancienne) si le tableau contient déjà 12 valeurs
    if (entreprise.chart.month.length === 12) {

        let months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        let date = new Date()
        let fullDate = months[date.getMonth()] + " " + date.getFullYear()

        let general = entreprise.chart.general[0]
        let group1 = entreprise.chart.group1[0]
        let group2 = entreprise.chart.group2[0]
        let group3 = entreprise.chart.group3[0]

        const data = {
            fullDate,
            general,
            group1,
            group2,
            group3
        };

        entreprise.archives.push(data);

        entreprise.chart.month.splice(0, 1)
        entreprise.chart.general.splice(0, 1)
        entreprise.chart.group1.splice(0, 1)
        entreprise.chart.group2.splice(0, 1)
        entreprise.chart.group3.splice(0, 1)
    }

    // On push les données dans des tableaux pour pouvoir créer les graphs
    let months = ['Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Déc'];
    let month = new Date()
    entreprise.chart.month.push(months[month.getMonth()]);
    entreprise.chart.general.push(entreprise.healthData.general);
    entreprise.chart.group1.push(entreprise.healthData.group1);
    entreprise.chart.group2.push(entreprise.healthData.group2);
    entreprise.chart.group3.push(entreprise.healthData.group3);
}

exports.updateHealthData = updateEntrepriseHealthData;
