import {  getFilter } from './filtertest';

describe('Tests des fonctions de l\'application de recettes', () => {
    
    let allRecipes;

    beforeEach(() => {
        allRecipes = [
            { id: 1, name: 'Limonade de coco', description: "Mettre les glaçons à votre goût dans le blender, ajouter le lait, la crème de coco, le jus de 2 citrons et le sucre. Mixer jusqu'à avoir la consistence désirée", ingredients: [{ ingredient: 'Lait de coco' }] },
            { id: 2, name: 'Poisson Cru à la taihitienne', description: 'Découper le thon en dés, mettre dans un plat et recouvrir de jus de citron vert (mieux vaut prendre un plat large et peu profond). Laisser reposer au réfrigérateur au moins 2 heures. (Si possible faites-le le soir pour le lendemain. Après avoir laissé mariner le poisson, coupez le concombre en fines rondelles sans la peau et les tomates en prenant soin de retirer les pépins. Rayer la carotte. Ajouter les légumes au poissons avec le citron cette fois ci dans un Saladier. Ajouter le lait de coco. Pour ajouter un peu plus de saveur vous pouvez ajouter 1 à 2 cuillères à soupe de Crème de coco', ingredients: [{ ingredient: 'Thon Rouge (ou blanc)' }] }
        ];
    });

    test('getFilter récupère les données correctement', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(allRecipes),
                headers: {
                    get: () => 'some-date'
                }
            })
        );

        await getFilter();

        expect(allRecipes).toEqual(allRecipes);
    });
});