// Gerado por tools/build-sw.mjs. Não editar manualmente.
'use strict';

const APP_ID = "academia-iat";
const VERSAO = "f191553af32d4429";
const BASE = "/academia-iat/";
const CACHE_PREFIX = "academia-iat:academia-iat:";
const CACHE_NUCLEO_PREFIX = CACHE_PREFIX + 'core:';
const CACHE_NUCLEO = CACHE_NUCLEO_PREFIX + VERSAO;
const CACHE_MIDIA = "academia-iat:academia-iat:media:v1";
const PRECACHE = ["/academia-iat/","/academia-iat/index.html","/academia-iat/assets/CaseAnswerSheet-CnlgLOzD.js","/academia-iat/assets/ContaLinkPage-A9WE0FzH.js","/academia-iat/assets/ContaRemotaCard-Bw-VCyV6.js","/academia-iat/assets/Flowcharts-Du7xGMFE.js","/academia-iat/assets/NormativeAuthorityAxes-aUvFaCbM.js","/academia-iat/assets/OfflineManager-CrX9Um_0.js","/academia-iat/assets/appData-Bgh9Y6BI.js","/academia-iat/assets/audiovisual-pilot-media-B5VThBD6.json","/academia-iat/assets/aula-media-CoWC-3d3.json","/academia-iat/assets/avaliacoes-DKlZMKYV.js","/academia-iat/assets/biblioteca-DQllq2dC.js","/academia-iat/assets/busca-DNaP1tSd.js","/academia-iat/assets/contaLinks-Dgkkg9IB.js","/academia-iat/assets/contaRemota-BmjcteQq.js","/academia-iat/assets/courseData-DVD_px4V.js","/academia-iat/assets/derivados-D1FHBkhX.js","/academia-iat/assets/flowcharts-content-DpdkJ10M.json","/academia-iat/assets/formacao-CPGAOkPO.js","/academia-iat/assets/hydro-ChVC3uIa.js","/academia-iat/assets/hydro-dtiuT6Rw.css","/academia-iat/assets/index-3QNhAdSK.js","/academia-iat/assets/lab-answer-reasons-Bqs3vCdC.json","/academia-iat/assets/lab-corpos-_lOfQtj2.json","/academia-iat/assets/lab-index-DUhpvRJY.json","/academia-iat/assets/labSourceIndex-BfnU0tW4.js","/academia-iat/assets/laboratorio-D5r5LKOL.js","/academia-iat/assets/lessonEvidence-C6sYkkHn.js","/academia-iat/assets/lessonObjective-B6HefVXe.css","/academia-iat/assets/lessonObjective-BQiD6Fc9.js","/academia-iat/assets/licao-Dr4bhx-7.js","/academia-iat/assets/main-BfinC4ly.css","/academia-iat/assets/main-DqMOOuoL.js","/academia-iat/assets/mapa-CFolfelf.js","/academia-iat/assets/mapa-D6EDSrpt.css","/academia-iat/assets/mapa-parana-CVApcY-G.json","/academia-iat/assets/mobileNavigation-B-t8n8Dk.css","/academia-iat/assets/officialSources-Cc4fbf5H.js","/academia-iat/assets/offline-0WeWVkmV.js","/academia-iat/assets/offline-packages-B-zWnt6d.json","/academia-iat/assets/painelAluno-S-Ec1GrZ.js","/academia-iat/assets/perfil-C2SvV-T-.js","/academia-iat/assets/pop-public-content-t_4ddTcZ.json","/academia-iat/assets/preload-helper-CgXSye3D.js","/academia-iat/assets/profile-DB6Jxfrv.js","/academia-iat/assets/question-bank-BJBti7fd.json","/academia-iat/assets/redator-DcurgYLe.js","/academia-iat/assets/redatorIT-CV_zjfVr.js","/academia-iat/assets/rolldown-runtime-Bh1tDfsg.js","/academia-iat/assets/routeStyles-C8M0fj9q.css","/academia-iat/assets/sincroniaAutomatica-DwfIwoBK.js","/academia-iat/assets/ui-TwCnUD6m.js","/academia-iat/assets/useMediaQuery-BpIGELj9.js","/academia-iat/assets/vendor-icons-C5r0xN4z.js","/academia-iat/assets/vendor-react-D6m9Rg4C.js","/academia-iat/manifest.webmanifest","/academia-iat/icone-192.png","/academia-iat/icone-512.png","/academia-iat/media/learning-stage/professor-sprite.webp","/academia-iat/media/learning-stage/thematic-atlas.webp"];
const REVISOES_MIDIA = {"hidro/arranjos.png":"5f925416355b37b0","hidro/componentes.png":"6c9af92b0e14a706","hidro/fluxo-tecnico.png":"acc26882326ac6c9","hidro/funcionamento.gif":"c75dcafc1a336160","hidro/reversivel-bath-county.jpg":"972c1e5ba23a824f","hidro/turbina-francis.jpg":"ef5c7ec22e6a1dae","hidro/turbina-kaplan.jpg":"5dc7e9bfa38cab75","hidro/turbina-pelton.jpg":"73f8987ccd5302c7","hidro/usina-corte-realista.webp":"d724808859a196f7","media/README.md":"af2f9055e5398a97","media/analista-licenciamento.png":"c80879c1c6028d69","media/aula/manifest.json":"cf3e569c7feb9020","media/aula/pop-section-001.jpg":"547fd1877dc8ad43","media/aula/pop-section-001.mp4":"e775e05d0be0282f","media/aula/pop-section-001.visemes.json":"b3d5e5e180adf931","media/aula/pop-section-001.vtt":"99b99c67154ca8da","media/aula/pop-section-002.jpg":"c3c91ac79b7d7604","media/aula/pop-section-002.mp4":"bd6cf884111508b4","media/aula/pop-section-002.visemes.json":"f68a6aae4e1d0d70","media/aula/pop-section-002.vtt":"e03e2c1732e61973","media/aula/pop-section-003.jpg":"b2f2c7556e6ff634","media/aula/pop-section-003.mp4":"a6992dbc04297591","media/aula/pop-section-003.visemes.json":"48b8cad3b8852df6","media/aula/pop-section-003.vtt":"5871b80ad37bf328","media/aula/pop-section-004.jpg":"2b55d53a6f529969","media/aula/pop-section-004.mp4":"d9fe19f3b2cdc441","media/aula/pop-section-004.visemes.json":"bae14586f120ad1d","media/aula/pop-section-004.vtt":"35d1850f6f21abf9","media/aula/pop-section-005.jpg":"6e72bc4188db9ed8","media/aula/pop-section-005.mp4":"5f44ab2551d62bb8","media/aula/pop-section-005.visemes.json":"3d554fb720cd539d","media/aula/pop-section-005.vtt":"48eb1125544fe3b9","media/aula/pop-section-006.jpg":"d31d5126c8e202f6","media/aula/pop-section-006.mp4":"814946a8e4e677a9","media/aula/pop-section-006.visemes.json":"3382b47726bf6f2c","media/aula/pop-section-006.vtt":"670acd09051f3859","media/aula/pop-section-007.jpg":"d76c218d600c68a3","media/aula/pop-section-007.mp4":"3166ba050ad79c8a","media/aula/pop-section-007.visemes.json":"599606eec769c70a","media/aula/pop-section-007.vtt":"59f63cf898a51f36","media/aula/pop-section-008.jpg":"df082089012b0c3a","media/aula/pop-section-008.mp4":"878c086ad6226801","media/aula/pop-section-008.visemes.json":"4b7f29d3ffecf002","media/aula/pop-section-008.vtt":"841e1263e54621e4","media/aula/pop-section-009.jpg":"cc5b334ed6948e06","media/aula/pop-section-009.mp4":"675505ebd8e35eed","media/aula/pop-section-009.visemes.json":"b673af87c0bf9f8c","media/aula/pop-section-009.vtt":"148dd87bb4aed1ab","media/aula/pop-section-010.jpg":"d81c6efbf0b6c6e6","media/aula/pop-section-010.mp4":"323a86082cd90b41","media/aula/pop-section-010.visemes.json":"6a6d40d5fbb7bb6c","media/aula/pop-section-010.vtt":"e8a0bbb3f4198552","media/aula/pop-section-011.jpg":"5dab76e9c7101ad7","media/aula/pop-section-011.mp4":"b05555b590640584","media/aula/pop-section-011.visemes.json":"4b1ad537c7d74f06","media/aula/pop-section-011.vtt":"e47ad4c454c6c9a5","media/aula/pop-section-012.jpg":"65f9cf41dd48284f","media/aula/pop-section-012.mp4":"b9dc453ff8040bdc","media/aula/pop-section-012.visemes.json":"85e734cf68116fb2","media/aula/pop-section-012.vtt":"ad974942d372067f","media/aula/pop-section-013.jpg":"3bbe3c6c7a671d29","media/aula/pop-section-013.mp4":"1f33a37dc0465502","media/aula/pop-section-013.visemes.json":"1d54af9cf6292fc9","media/aula/pop-section-013.vtt":"d3371511f5f96b48","media/aula/pop-section-015.jpg":"8aa8fb2b396ca556","media/aula/pop-section-015.mp4":"c7b17357a16cf9de","media/aula/pop-section-015.visemes.json":"8bbaca2471a0d084","media/aula/pop-section-015.vtt":"a21fb05128875088","media/aula/pop-section-016.jpg":"f638ab8b672512e9","media/aula/pop-section-016.mp4":"34db3bcd5f15d0ee","media/aula/pop-section-016.visemes.json":"9cb24d05d170ec19","media/aula/pop-section-016.vtt":"3264cf95e49782c6","media/aula/pop-section-017.jpg":"ad0eaa77553fa0c2","media/aula/pop-section-017.mp4":"aca3b797901dda60","media/aula/pop-section-017.visemes.json":"65a308667b2a5d44","media/aula/pop-section-017.vtt":"6357bc323d9a39f7","media/aula/pop-section-018.jpg":"9e82624ce3b45be6","media/aula/pop-section-018.mp4":"145acac7a945bfbb","media/aula/pop-section-018.visemes.json":"461b505d4b7bdb14","media/aula/pop-section-018.vtt":"646a2ae9451d0def","media/aula/pop-section-019.jpg":"cac788e0f5109a85","media/aula/pop-section-019.mp4":"df8f1b72f90ff1c4","media/aula/pop-section-019.visemes.json":"4e972844e4d13f0c","media/aula/pop-section-019.vtt":"db77b159761f2a48","media/aula/pop-section-020.jpg":"46842c96a3d67495","media/aula/pop-section-020.mp4":"bf929ce07e70e9cc","media/aula/pop-section-020.visemes.json":"5dadf25339408d0a","media/aula/pop-section-020.vtt":"a6fb46e15f301daf","media/aula/pop-section-021.jpg":"5d5ad074ce7c1e59","media/aula/pop-section-021.mp4":"59af5c13b3488dd9","media/aula/pop-section-021.visemes.json":"2087c0ca86c1d90d","media/aula/pop-section-021.vtt":"25a169d42b59040c","media/aula/pop-section-022.jpg":"d9c9558d3764515d","media/aula/pop-section-022.mp4":"b1d404e2e723cf92","media/aula/pop-section-022.visemes.json":"86f00868f7646208","media/aula/pop-section-022.vtt":"b629b0933837d7b7","media/aula/pop-section-023.jpg":"cae8be5960a2a50d","media/aula/pop-section-023.mp4":"b62f81a6420c7ab7","media/aula/pop-section-023.visemes.json":"e43ba8f7b2897895","media/aula/pop-section-023.vtt":"87bd8ad89ff6f485","media/aula/pop-section-024.jpg":"28fa13d330515c2d","media/aula/pop-section-024.mp4":"6b6569d1ffdaa0f8","media/aula/pop-section-024.visemes.json":"1e1d044934bffcc3","media/aula/pop-section-024.vtt":"4dd29c34513e4d52","media/aula/pop-section-025.jpg":"85e2ae8386d811f9","media/aula/pop-section-025.mp4":"730045eba499ffd8","media/aula/pop-section-025.visemes.json":"3972ca9073f50d2d","media/aula/pop-section-025.vtt":"ac351798f8b0ee01","media/aula/pop-section-026.jpg":"e61d5cf7d5af047d","media/aula/pop-section-026.mp4":"6fd605b5c7abd944","media/aula/pop-section-026.visemes.json":"9ff9fe266bfd8e57","media/aula/pop-section-026.vtt":"fb3850dfc2b88a83","media/aula/pop-section-027.jpg":"2c2f3daf10f39bd4","media/aula/pop-section-027.mp4":"d7d347063704d8b7","media/aula/pop-section-027.visemes.json":"12400cad22209c42","media/aula/pop-section-027.vtt":"d11fe3134db7808a","media/aula/pop-section-028.jpg":"446da2c7a33877cb","media/aula/pop-section-028.mp4":"2386e2ed1bc703b0","media/aula/pop-section-028.visemes.json":"64933ba443b1c878","media/aula/pop-section-028.vtt":"070835764da5bead","media/aula/pop-section-029.jpg":"21c24976b18308d2","media/aula/pop-section-029.mp4":"0da53b94636f135d","media/aula/pop-section-029.visemes.json":"504a5885140c098f","media/aula/pop-section-029.vtt":"b82ec567f1a6e251","media/aula/pop-section-030.jpg":"7c6ae5976bbd2d67","media/aula/pop-section-030.mp4":"b29c56db5c22fa17","media/aula/pop-section-030.visemes.json":"cbcbc447384d5321","media/aula/pop-section-030.vtt":"96185cc85ccb400d","media/aula/pop-section-031.jpg":"f259b65e1423842d","media/aula/pop-section-031.mp4":"945b8ca18ab594a1","media/aula/pop-section-031.visemes.json":"2830c67fa79f27a2","media/aula/pop-section-031.vtt":"7a80dac3450a3498","media/aula/pop-section-032.jpg":"d54772958e27b78e","media/aula/pop-section-032.mp4":"8caa6f5eb8c11da2","media/aula/pop-section-032.visemes.json":"a95ca3d5a1d03e72","media/aula/pop-section-032.vtt":"811e92e4e51a3cff","media/aula/pop-section-033.jpg":"c477bef4f6cc6d91","media/aula/pop-section-033.mp4":"7ad6c9ce0590ddb2","media/aula/pop-section-033.visemes.json":"4c30b718e1a83c27","media/aula/pop-section-033.vtt":"22371dc1a23f2c07","media/aula/pop-section-034.jpg":"0e050d99437a3d50","media/aula/pop-section-034.mp4":"27d4a71659d5b359","media/aula/pop-section-034.visemes.json":"f5bbf27c49c1ab69","media/aula/pop-section-034.vtt":"077851486b5a0f99","media/aula/pop-section-035.jpg":"ffe9eac7c27b574b","media/aula/pop-section-035.mp4":"f1befc620337ce04","media/aula/pop-section-035.visemes.json":"55f12b2e368430f3","media/aula/pop-section-035.vtt":"87cb53772a70b350","media/aula/pop-section-036.jpg":"e7d217842ebaab21","media/aula/pop-section-036.mp4":"5a8c7e71a6ed7c19","media/aula/pop-section-036.visemes.json":"e6c929f9066a8e2d","media/aula/pop-section-036.vtt":"b6cddf7127581a98","media/aula/pop-section-037.jpg":"18a65b48e9b95a43","media/aula/pop-section-037.mp4":"42bbcc56fa57498b","media/aula/pop-section-037.visemes.json":"71f0ff06bb1ecd4a","media/aula/pop-section-037.vtt":"ce3e05cbc9023404","media/aula/pop-section-038.jpg":"a89943ef2ed8be63","media/aula/pop-section-038.mp4":"61d061c954708e0a","media/aula/pop-section-038.visemes.json":"ef9845e381efcc68","media/aula/pop-section-038.vtt":"03b0704f02909bc8","media/aula/pop-section-039.jpg":"878da3b36e32f4f4","media/aula/pop-section-039.mp4":"3574dff9abf6a481","media/aula/pop-section-039.visemes.json":"c45b81cbfa5f907d","media/aula/pop-section-039.vtt":"0bed56137c8a9462","media/aula/pop-section-040.jpg":"43ad969c7b8fe2f0","media/aula/pop-section-040.mp4":"b9dd02c6a8926c2c","media/aula/pop-section-040.visemes.json":"12488983ed99eefb","media/aula/pop-section-040.vtt":"c0906608932ab688","media/aula/pop-section-041.jpg":"8834e6175f1e2b55","media/aula/pop-section-041.mp4":"5940b982ff0216f4","media/aula/pop-section-041.visemes.json":"cffce2f40517f5d7","media/aula/pop-section-041.vtt":"e682617c0d6cd608","media/aula/pop-section-042.jpg":"bf018f1b63beb879","media/aula/pop-section-042.mp4":"e9db1eb0ddd0b78f","media/aula/pop-section-042.visemes.json":"e3fcb6a7df5e0f80","media/aula/pop-section-042.vtt":"08d43f7f2abd89bd","media/aula/pop-section-043.jpg":"56133599ba8ed2c7","media/aula/pop-section-043.mp4":"7744d162a113951c","media/aula/pop-section-043.visemes.json":"0586a777e2338457","media/aula/pop-section-043.vtt":"db627bc5bddd1e38","media/aula/pop-section-045.jpg":"f44d196c48c461b6","media/aula/pop-section-045.mp4":"0b457c82035de04e","media/aula/pop-section-045.visemes.json":"1431ee28859c1e5d","media/aula/pop-section-045.vtt":"639b2336e16b31ee","media/aula/pop-section-046.jpg":"d7933c4d46285bdc","media/aula/pop-section-046.mp4":"35c465239f28a0e3","media/aula/pop-section-046.visemes.json":"6805eb9b5bab3d63","media/aula/pop-section-046.vtt":"739e6c380c27a5db","media/aula/pop-section-047.jpg":"e1105e236216a511","media/aula/pop-section-047.mp4":"d01621c4808da988","media/aula/pop-section-047.visemes.json":"5b17488bdae41c29","media/aula/pop-section-047.vtt":"5c97f84a5e48206f","media/aula/pop-section-048.jpg":"1ce6a27cf47d450f","media/aula/pop-section-048.mp4":"19790c9166a03bf0","media/aula/pop-section-048.visemes.json":"5a0c4f0af9e45345","media/aula/pop-section-048.vtt":"d34b1d12adfd49ac","media/aula/pop-section-049.jpg":"54537d5ea2cde1fd","media/aula/pop-section-049.mp4":"d206fe22edecb0ed","media/aula/pop-section-049.visemes.json":"49a5b42fc3884782","media/aula/pop-section-049.vtt":"276d77aac7ced09d","media/aula/pop-section-050.jpg":"226650eb05e8865d","media/aula/pop-section-050.mp4":"4b097c852b44471d","media/aula/pop-section-050.visemes.json":"eee7b17f801a4822","media/aula/pop-section-050.vtt":"f83d9c0cd2374f20","media/aula/pop-section-051.jpg":"2fec406fcec91a0d","media/aula/pop-section-051.mp4":"0cfe84533751163b","media/aula/pop-section-051.visemes.json":"1620c33909ddfab5","media/aula/pop-section-051.vtt":"503528934864a7bc","media/aula/pop-section-052.jpg":"c0b1410e7b7ba0b5","media/aula/pop-section-052.mp4":"86e1e551ff765988","media/aula/pop-section-052.visemes.json":"79028383835fad0b","media/aula/pop-section-052.vtt":"2d535e1a9de9c27c","media/aula/pop-section-053.jpg":"1bc3ab88767d9cd8","media/aula/pop-section-053.mp4":"69c97b6ed86bff04","media/aula/pop-section-053.visemes.json":"7616507c8b044470","media/aula/pop-section-053.vtt":"6df4ef606ef871c9","media/aula/pop-section-054.jpg":"611e186ed6cc88ad","media/aula/pop-section-054.mp4":"d7cd779eb3d1f418","media/aula/pop-section-054.visemes.json":"be0668c7c756be97","media/aula/pop-section-054.vtt":"16ee60157741e237","media/aula/pop-section-055.jpg":"2c1140885d0d9bb6","media/aula/pop-section-055.mp4":"f52fea67c1f08c79","media/aula/pop-section-055.visemes.json":"3f299749d51538f5","media/aula/pop-section-055.vtt":"fbd71e2490b917dc","media/aula/pop-section-056.jpg":"aab0fbb66be68c98","media/aula/pop-section-056.mp4":"e2e5f6097ded85ab","media/aula/pop-section-056.visemes.json":"56dc37d1aee14df5","media/aula/pop-section-056.vtt":"26030847a02ac82c","media/aula/pop-section-057.jpg":"e8afff66d34cf8ce","media/aula/pop-section-057.mp4":"d745221fd05cf0d9","media/aula/pop-section-057.visemes.json":"c70592717d353df9","media/aula/pop-section-057.vtt":"e6011449556ae4dd","media/aula/pop-section-058.jpg":"7885d282262da80c","media/aula/pop-section-058.mp4":"fc9e900d92d8ccac","media/aula/pop-section-058.visemes.json":"4270a8ef08ff4bac","media/aula/pop-section-058.vtt":"bb6a42d04ce42236","media/aula/pop-section-059.jpg":"b626e29cfb4b741e","media/aula/pop-section-059.mp4":"58a6433b91f6fa62","media/aula/pop-section-059.visemes.json":"1ed11d7468bba1a1","media/aula/pop-section-059.vtt":"1d2651d5bb82742c","media/aula/pop-section-060.jpg":"435d8e6e41aaadc6","media/aula/pop-section-060.mp4":"41316815499602df","media/aula/pop-section-060.visemes.json":"f58ae95996d8ad99","media/aula/pop-section-060.vtt":"57a71e80d26e9dd7","media/aula/pop-section-061.jpg":"68a643561e531446","media/aula/pop-section-061.mp4":"a99dcb73e3832e2e","media/aula/pop-section-061.visemes.json":"3b6035b120121940","media/aula/pop-section-061.vtt":"bb3c16a9b7016186","media/aula/pop-section-062.jpg":"08c9001f0c7d2bb5","media/aula/pop-section-062.mp4":"32a1cad7b6d9f6d4","media/aula/pop-section-062.visemes.json":"a74cf0d422847a1d","media/aula/pop-section-062.vtt":"00eea749e9137acd","media/aula/pop-section-063.jpg":"d8d9df979d912ac9","media/aula/pop-section-063.mp4":"e1cb8266cc086ce6","media/aula/pop-section-063.visemes.json":"c70043f246767e6a","media/aula/pop-section-063.vtt":"cf363f09afd5f333","media/aula/pop-section-064.jpg":"008b7880c19a2c56","media/aula/pop-section-064.mp4":"8477462e89faf447","media/aula/pop-section-064.visemes.json":"27eaa29c8202bccb","media/aula/pop-section-064.vtt":"2b951f1935897465","media/aula/pop-section-065.jpg":"d6fd573a17e1db86","media/aula/pop-section-065.mp4":"6e49bc787f574f1e","media/aula/pop-section-065.visemes.json":"5a37912e28a49c05","media/aula/pop-section-065.vtt":"93c940fbf409e15c","media/aula/pop-section-066.jpg":"c208be12d6b8fef1","media/aula/pop-section-066.mp4":"ce8eecda61b1b393","media/aula/pop-section-066.visemes.json":"092db6fe4852ecf1","media/aula/pop-section-066.vtt":"e102ac854600a552","media/aula/pop-section-067.jpg":"48ebc462ecaa390e","media/aula/pop-section-067.mp4":"00934e4d9557af3e","media/aula/pop-section-067.visemes.json":"09d25283f1efca96","media/aula/pop-section-067.vtt":"ee92308b4841afc8","media/aula/pop-section-068.jpg":"3aab1c503ea3fd95","media/aula/pop-section-068.mp4":"ea4133ec3a887688","media/aula/pop-section-068.visemes.json":"3dfb3b54e7ddc1b1","media/aula/pop-section-068.vtt":"98da2231c5b6d3ac","media/aula/pop-section-069.jpg":"31dbd815d2ec7384","media/aula/pop-section-069.mp4":"0ab185eccdda405a","media/aula/pop-section-069.visemes.json":"d04fff40cadca8eb","media/aula/pop-section-069.vtt":"fb3f80eac721708d","media/aula/pop-section-070.jpg":"5684a71dbd3260fa","media/aula/pop-section-070.mp4":"8e85bb1b3501006a","media/aula/pop-section-070.visemes.json":"dc9969393ec3f2d1","media/aula/pop-section-070.vtt":"ba4b0c4a76e7c183","media/aula/pop-section-071.jpg":"cb0df95939010098","media/aula/pop-section-071.mp4":"72544d7729094969","media/aula/pop-section-071.visemes.json":"465294239d5d9111","media/aula/pop-section-071.vtt":"030c3f0cd420575c","media/aula/pop-section-072.jpg":"3b6c8d9ac3287105","media/aula/pop-section-072.mp4":"d049ffd6a3eb2327","media/aula/pop-section-072.visemes.json":"6286b832c9f9c077","media/aula/pop-section-072.vtt":"e54803f4916e35e6","media/aula/pop-section-073.jpg":"5c4d8da41eccc02a","media/aula/pop-section-073.mp4":"08225fbff8b8fe82","media/aula/pop-section-073.visemes.json":"8c1d34b31b17f26c","media/aula/pop-section-073.vtt":"1a24c9d56dc7a86a","media/aula/pop-section-074.jpg":"9c32dc75eca900eb","media/aula/pop-section-074.mp4":"bf92857e7a1fba22","media/aula/pop-section-074.visemes.json":"c746b45ffe45037d","media/aula/pop-section-074.vtt":"e8e9822dddc4f5c4","media/aula/pop-section-075.jpg":"7af49d345d4847e2","media/aula/pop-section-075.mp4":"bfdb0326e0129108","media/aula/pop-section-075.visemes.json":"6a11bac46a4af0b5","media/aula/pop-section-075.vtt":"7f0cca72c348b24b","media/aula/pop-section-076.jpg":"652f53cecc77f3c9","media/aula/pop-section-076.mp4":"eb0e75b53d99325e","media/aula/pop-section-076.visemes.json":"885e6980030c8566","media/aula/pop-section-076.vtt":"05399f18f43118b9","media/aula/pop-section-078.jpg":"68f09517d4c0bc08","media/aula/pop-section-078.mp4":"f53ae8d85b6fa7cc","media/aula/pop-section-078.visemes.json":"26f5083a8b93876a","media/aula/pop-section-078.vtt":"11674ce24e356c00","media/aula/pop-section-079.jpg":"12225572d069a76b","media/aula/pop-section-079.mp4":"6f9e81ee37ab9cca","media/aula/pop-section-079.visemes.json":"8e05a0994d5c4e8a","media/aula/pop-section-079.vtt":"2ada740e670bc38b","media/aula/pop-section-080.jpg":"9884ff8b7b8693ea","media/aula/pop-section-080.mp4":"f3412b8777eccfe4","media/aula/pop-section-080.visemes.json":"2630788e5406d271","media/aula/pop-section-080.vtt":"4fda42187695da23","media/aula/pop-section-081.jpg":"e4b6df34fe0d8e96","media/aula/pop-section-081.mp4":"c0a7b7a69a5ff303","media/aula/pop-section-081.visemes.json":"11bce804fa63e9f8","media/aula/pop-section-081.vtt":"0624f46aa6271f42","media/aula/pop-section-082.jpg":"8fb2bd62a9f9d63a","media/aula/pop-section-082.mp4":"e7a7f154e02527e6","media/aula/pop-section-082.visemes.json":"c6721b4fd0765d98","media/aula/pop-section-082.vtt":"986969387a08a9d3","media/aula/pop-section-083.jpg":"9845bbc39cac5b41","media/aula/pop-section-083.mp4":"8364a5bc3f28abde","media/aula/pop-section-083.visemes.json":"ce288ee14d4be092","media/aula/pop-section-083.vtt":"c6345bf873db1576","media/aula/pop-section-084.jpg":"3554def14257f45b","media/aula/pop-section-084.mp4":"3474892c299eda63","media/aula/pop-section-084.visemes.json":"c7877865e1e8bc65","media/aula/pop-section-084.vtt":"67ff209eebd17619","media/aula/pop-section-085.jpg":"08bde239b1fda0e9","media/aula/pop-section-085.mp4":"1a8898638848d25e","media/aula/pop-section-085.visemes.json":"412b72e415762cf7","media/aula/pop-section-085.vtt":"0bf6533984beba3c","media/aula/pop-section-086.jpg":"2f8825dc521e6c6b","media/aula/pop-section-086.mp4":"7fef18c4a9550396","media/aula/pop-section-086.visemes.json":"45b98c3328ec9af4","media/aula/pop-section-086.vtt":"9ba576bf89267c5f","media/aula/pop-section-087.jpg":"a5628f703d8bf801","media/aula/pop-section-087.mp4":"e260161bb8285b85","media/aula/pop-section-087.visemes.json":"6c6eaa4d72110922","media/aula/pop-section-087.vtt":"8c137d486734d706","media/aula/pop-section-088.jpg":"a6112905828f74bf","media/aula/pop-section-088.mp4":"2d794a9cb5842084","media/aula/pop-section-088.visemes.json":"9ccae7157f47037d","media/aula/pop-section-088.vtt":"01adb769503b5ceb","media/aula/pop-section-089.jpg":"4ca2377f43122d86","media/aula/pop-section-089.mp4":"0cd89bbaeacf98af","media/aula/pop-section-089.visemes.json":"1014c2880e2c1c92","media/aula/pop-section-089.vtt":"6a8e77f22664ea1e","media/aula/pop-section-090.jpg":"70cf13ea481acfcb","media/aula/pop-section-090.mp4":"cc5c17124bb408c2","media/aula/pop-section-090.visemes.json":"546fc81419b13505","media/aula/pop-section-090.vtt":"a390be2038fbab9d","media/aula/pop-section-091.jpg":"41450717b8013473","media/aula/pop-section-091.mp4":"de0a0218d972009c","media/aula/pop-section-091.visemes.json":"628c7d3f26d9240b","media/aula/pop-section-091.vtt":"2de5685a9ca441c8","media/aula/pop-section-092.jpg":"4edf2b09ef0cb4ff","media/aula/pop-section-092.mp4":"be1cf2719bdb961a","media/aula/pop-section-092.visemes.json":"d1cd6b1d5b9520f9","media/aula/pop-section-092.vtt":"2caffa4caee60594","media/aula/pop-section-093.jpg":"e732b5f58b03b7d5","media/aula/pop-section-093.mp4":"906bfd775e8a4b27","media/aula/pop-section-093.visemes.json":"4da8c7684e0fa4fd","media/aula/pop-section-093.vtt":"85935e08d2bc51c8","media/aula/pop-section-094.jpg":"acd969af41393d5e","media/aula/pop-section-094.mp4":"72907e8762646faf","media/aula/pop-section-094.visemes.json":"d11e23cd5dd29a25","media/aula/pop-section-094.vtt":"a115d3726f1e5001","media/aula/pop-section-095.jpg":"8e7866e1ca0bede3","media/aula/pop-section-095.mp4":"b99e8eb0b70f9b67","media/aula/pop-section-095.visemes.json":"bc0a80c0462508eb","media/aula/pop-section-095.vtt":"331068aedbc90f68","media/aula/pop-section-096.jpg":"7808219743d0dc1b","media/aula/pop-section-096.mp4":"714f117698d91c49","media/aula/pop-section-096.visemes.json":"a28d2345bffa26cd","media/aula/pop-section-096.vtt":"f69464fca28e1e0a","media/aula/pop-section-097.jpg":"12bc2dad12d867d4","media/aula/pop-section-097.mp4":"4b0c9fde0973d166","media/aula/pop-section-097.visemes.json":"eefbf87a87a5d6c4","media/aula/pop-section-097.vtt":"6fd5cdf816de05ee","media/aula/pop-section-098.jpg":"f650bf399ea3765f","media/aula/pop-section-098.mp4":"7cac8234ba3e751e","media/aula/pop-section-098.visemes.json":"bd0bcce5f669f9b5","media/aula/pop-section-098.vtt":"74af133520bbbb82","media/aula/pop-section-099.jpg":"b92a1595b7b74d2f","media/aula/pop-section-099.mp4":"33499c7f8df59e45","media/aula/pop-section-099.visemes.json":"56f8f4a7c1bbb1cc","media/aula/pop-section-099.vtt":"8f6541c5ba0d4148","media/aula/pop-section-100.jpg":"dd6b224ff8aa247b","media/aula/pop-section-100.mp4":"8fe81efac21f774f","media/aula/pop-section-100.visemes.json":"3ac241b7c29ded51","media/aula/pop-section-100.vtt":"d0b4b5d89e32fd94","media/aula/pop-section-101.jpg":"e847c318da58bdcd","media/aula/pop-section-101.mp4":"392c8c24dd930f02","media/aula/pop-section-101.visemes.json":"cbf7b16c0743ddb2","media/aula/pop-section-101.vtt":"565832f91dd86e4c","media/aula/pop-section-102.jpg":"d86764ea750a02c2","media/aula/pop-section-102.mp4":"f8b5afd663f98594","media/aula/pop-section-102.visemes.json":"a6a9d6e918d8af4a","media/aula/pop-section-102.vtt":"1a00617e2271fd0e","media/aula/pop-section-103.jpg":"79c57b2d90dd7cb3","media/aula/pop-section-103.mp4":"e3a3801cd5c9e602","media/aula/pop-section-103.visemes.json":"c8ad6ccc4e7189c3","media/aula/pop-section-103.vtt":"593031683cf4ede3","media/aula/pop-section-104.jpg":"8b7d773712953efb","media/aula/pop-section-104.mp4":"c6134f3ffe5b2ddf","media/aula/pop-section-104.visemes.json":"55316222b5be5312","media/aula/pop-section-104.vtt":"abc6ef383756e6a9","media/aula/pop-section-105.jpg":"3dce5132d5f8f296","media/aula/pop-section-105.mp4":"4409bebdc035a091","media/aula/pop-section-105.visemes.json":"f3aa5a052b13e4cc","media/aula/pop-section-105.vtt":"8a84a133274d951d","media/aula/pop-section-106.jpg":"023ed240309fb299","media/aula/pop-section-106.mp4":"b6be27ddbe2dcab0","media/aula/pop-section-106.visemes.json":"0458bd8975babec0","media/aula/pop-section-106.vtt":"673b15b88652c282","media/aula/pop-section-107.jpg":"c94892ac67ba900f","media/aula/pop-section-107.mp4":"f244d71b1930cac6","media/aula/pop-section-107.visemes.json":"14731702082317b6","media/aula/pop-section-107.vtt":"946b6ab0c94d37cb","media/aula/pop-section-108.jpg":"d5e6f5f5357b8016","media/aula/pop-section-108.mp4":"517936c2ef0d9557","media/aula/pop-section-108.visemes.json":"f4a529991036d6a2","media/aula/pop-section-108.vtt":"dc6d923133061415","media/aula/pop-section-109.jpg":"f004fe7fd1b52678","media/aula/pop-section-109.mp4":"d669ddd1d06810d3","media/aula/pop-section-109.visemes.json":"43d7ec7de38f7c03","media/aula/pop-section-109.vtt":"bc76607f0b550e8e","media/aula/pop-section-110.jpg":"d5aaadf1533fe250","media/aula/pop-section-110.mp4":"3c897120f70bb7f0","media/aula/pop-section-110.visemes.json":"eac6f4c233512908","media/aula/pop-section-110.vtt":"ee2c8abfc43b6297","media/aula/pop-section-111.jpg":"9b168dd165b05c46","media/aula/pop-section-111.mp4":"0a8b21d7aa23e880","media/aula/pop-section-111.visemes.json":"8c9b1dc0aa234417","media/aula/pop-section-111.vtt":"4e269726bee95c29","media/aula/pop-section-112.jpg":"a99122a10518561d","media/aula/pop-section-112.mp4":"585f357e75368b54","media/aula/pop-section-112.visemes.json":"e0451dd08141ab1f","media/aula/pop-section-112.vtt":"e77f697273695095","media/aula/pop-section-113.jpg":"5de351f83bb1188f","media/aula/pop-section-113.mp4":"7dceabb951a1f0d7","media/aula/pop-section-113.visemes.json":"fc500cdd8e8e9301","media/aula/pop-section-113.vtt":"d3fdc52e278c54d2","media/aula/pop-section-114.jpg":"2156da99142ea6c1","media/aula/pop-section-114.mp4":"49804431d28d9846","media/aula/pop-section-114.visemes.json":"d2c33aee6a469efd","media/aula/pop-section-114.vtt":"e129b37470c1ea5d","media/aula/pop-section-115.jpg":"92ab139515c884f0","media/aula/pop-section-115.mp4":"de8bbd49457f0ce2","media/aula/pop-section-115.visemes.json":"1c68c42708453d6d","media/aula/pop-section-115.vtt":"22424b27c34bee3c","media/aula/pop-section-116.jpg":"8f8d79d8c566c2ad","media/aula/pop-section-116.mp4":"f70522b0a21c0fb9","media/aula/pop-section-116.visemes.json":"8833380b86aec9b3","media/aula/pop-section-116.vtt":"f8461c77368af143","media/aula/pop-section-117.jpg":"4477765405f67549","media/aula/pop-section-117.mp4":"3189e0878ff184c5","media/aula/pop-section-117.visemes.json":"ba21316324a91aeb","media/aula/pop-section-117.vtt":"03619dcf88ac5fda","media/aula/pop-section-118.jpg":"5cb181dd4a74acce","media/aula/pop-section-118.mp4":"3304d52579d84d8f","media/aula/pop-section-118.visemes.json":"04f2fe55fc00b21b","media/aula/pop-section-118.vtt":"8f6a0178d581dc9f","media/aula/pop-section-119.jpg":"4dec545c931a0238","media/aula/pop-section-119.mp4":"610fd264fabebef6","media/aula/pop-section-119.visemes.json":"6513f31220c59f45","media/aula/pop-section-119.vtt":"951cfb5f839347a6","media/aula/pop-section-120.jpg":"363a9378e854beda","media/aula/pop-section-120.mp4":"71c5510eff652e49","media/aula/pop-section-120.visemes.json":"a22b3a0711da0998","media/aula/pop-section-120.vtt":"4321c36625509036","media/aula/pop-section-121.jpg":"eb48a3e8488e8095","media/aula/pop-section-121.mp4":"241cb3818c5a5535","media/aula/pop-section-121.visemes.json":"f0e7ae531126c187","media/aula/pop-section-121.vtt":"e8b31e9f1c0ed3b8","media/aula/pop-section-122.jpg":"76243f5a4fe69be4","media/aula/pop-section-122.mp4":"4573062221c60d7a","media/aula/pop-section-122.visemes.json":"39055f11b1c5e11d","media/aula/pop-section-122.vtt":"cff8f1ad40a8942f","media/aula/pop-section-123.jpg":"ca67169930a7c312","media/aula/pop-section-123.mp4":"c612112434efef41","media/aula/pop-section-123.visemes.json":"693c659ec96952ce","media/aula/pop-section-123.vtt":"9892ef22eb98d7d4","media/aula/pop-section-124.jpg":"1e7f9a635c348bb8","media/aula/pop-section-124.mp4":"2e0fc9172e6e147c","media/aula/pop-section-124.visemes.json":"49de61c7390ba33f","media/aula/pop-section-124.vtt":"b54d315f2e0ede00","media/aula/pop-section-125.jpg":"bbdae41cfa3124b4","media/aula/pop-section-125.mp4":"5634c8b993b47800","media/aula/pop-section-125.visemes.json":"3ceea9f9b126005f","media/aula/pop-section-125.vtt":"905afeed7e8a1dac","media/aula/pop-section-132.jpg":"fe8bf65ec9fa65d4","media/aula/pop-section-132.mp4":"8492d25322407c26","media/aula/pop-section-132.visemes.json":"91cea40a4b892c5c","media/aula/pop-section-132.vtt":"6f503415c67a9730","media/aula/pop-section-133.jpg":"d50ec1d7a1df513a","media/aula/pop-section-133.mp4":"6477fb56b9a05105","media/aula/pop-section-133.visemes.json":"cacc38b9df59f0da","media/aula/pop-section-133.vtt":"34ee32f476eb5654","media/aula/pop-section-134.jpg":"172d84d133c2334a","media/aula/pop-section-134.mp4":"3ccd7d600c78f830","media/aula/pop-section-134.visemes.json":"089ef67a5c4dd3a5","media/aula/pop-section-134.vtt":"ac447b98fcfc7256","media/aula/pop-section-135.jpg":"abaaf88ba6240692","media/aula/pop-section-135.mp4":"49b199554d071a6f","media/aula/pop-section-135.visemes.json":"3f364d71d3d5998c","media/aula/pop-section-135.vtt":"0d5f993da064ac87","media/aula/pop-section-136.jpg":"f591632c93edbf10","media/aula/pop-section-136.mp4":"cc12fef7efc745f0","media/aula/pop-section-136.visemes.json":"52153200dae88b26","media/aula/pop-section-136.vtt":"eba95e668190752f","media/aula/pop-section-137.jpg":"07629d8698a2626b","media/aula/pop-section-137.mp4":"1098e54920b90f8b","media/aula/pop-section-137.visemes.json":"d30def432b4af9d2","media/aula/pop-section-137.vtt":"a0c8531b7794ef80","media/aula/pop-section-138.jpg":"44a6638bd869dc17","media/aula/pop-section-138.mp4":"5379c5f119688b15","media/aula/pop-section-138.visemes.json":"06a2ae202fa2b6b7","media/aula/pop-section-138.vtt":"cb6303e50ea4202d","media/aula/pop-section-139.jpg":"30876453fcddf47d","media/aula/pop-section-139.mp4":"8693a9245fcce93b","media/aula/pop-section-139.visemes.json":"6445093d52f4a61e","media/aula/pop-section-139.vtt":"63957cd0dc1c1ee1","media/aula/pop-section-140.jpg":"a821b3ea81b52c4c","media/aula/pop-section-140.mp4":"21dbab041fc504a3","media/aula/pop-section-140.visemes.json":"8c61fa0f483e1d93","media/aula/pop-section-140.vtt":"c66bf592367816bf","media/aula/pop-section-141.jpg":"157e06a6bade09c3","media/aula/pop-section-141.mp4":"74f1499c1190210c","media/aula/pop-section-141.visemes.json":"404bd87f074d33a4","media/aula/pop-section-141.vtt":"e3dbbcc956a1ffaa","media/aula/pop-section-142.jpg":"616d01d4445fa476","media/aula/pop-section-142.mp4":"2ddc5ad7d0378236","media/aula/pop-section-142.visemes.json":"5eeca9c35d13469f","media/aula/pop-section-142.vtt":"d7a390ce01309ba3","media/aula/pop-section-143.jpg":"11ed70c59a62ad5e","media/aula/pop-section-143.mp4":"9a9362d9f65f93a5","media/aula/pop-section-143.visemes.json":"398a43b07bda0bc7","media/aula/pop-section-143.vtt":"dd8aa8ca62df774f","media/aula/pop-section-144.jpg":"c23a96431c562b5e","media/aula/pop-section-144.mp4":"ccf4f7d6ba1221cc","media/aula/pop-section-144.visemes.json":"af008d2dd35229f9","media/aula/pop-section-144.vtt":"57196a37f26c2be3","media/aula/pop-section-145.jpg":"69101d9edf789349","media/aula/pop-section-145.mp4":"110b1101f9e9dcc2","media/aula/pop-section-145.visemes.json":"2cd3f696d7c8829b","media/aula/pop-section-145.vtt":"8aec3e641c8812ad","media/aula/pop-section-146.jpg":"d78bc946ac037f80","media/aula/pop-section-146.mp4":"cd395fb68923f7f5","media/aula/pop-section-146.visemes.json":"78f861b0974f588c","media/aula/pop-section-146.vtt":"5e57e38593914c5f","media/aula/pop-section-147.jpg":"ce92598ac3b7e08a","media/aula/pop-section-147.mp4":"ba08f4e1c8830b08","media/aula/pop-section-147.visemes.json":"87836596fc8544a7","media/aula/pop-section-147.vtt":"32e950906698bbfd","media/aula/pop-section-148.jpg":"d994affdae1d02d6","media/aula/pop-section-148.mp4":"bd0f34d7219f88ef","media/aula/pop-section-148.visemes.json":"793d1226b5bbf018","media/aula/pop-section-148.vtt":"1f8719c3f9a5463c","media/aula/pop-section-149.jpg":"9627da3ec5152a34","media/aula/pop-section-149.mp4":"c4d7d86699e116dc","media/aula/pop-section-149.visemes.json":"d9dae88f5cab8736","media/aula/pop-section-149.vtt":"689fe8cd9532be5e","media/aula/pop-section-150.jpg":"c95e077b8fd87b35","media/aula/pop-section-150.mp4":"c93be5451ce5d141","media/aula/pop-section-150.visemes.json":"764dc8dd6e5fa12c","media/aula/pop-section-150.vtt":"0569c5c7df615563","media/aula/pop-section-151.jpg":"e247d6deabe135bd","media/aula/pop-section-151.mp4":"0dab2f6ae5af7be2","media/aula/pop-section-151.visemes.json":"d0b2a115143bc63d","media/aula/pop-section-151.vtt":"6ed9419454978991","media/aula/pop-section-152.jpg":"eb1df2fda36ca2d5","media/aula/pop-section-152.mp4":"278c930ac779a078","media/aula/pop-section-152.visemes.json":"e508314c0f8eb21d","media/aula/pop-section-152.vtt":"9f77b61754ce74c0","media/aula/pop-section-153.jpg":"8a70c7eb4170937b","media/aula/pop-section-153.mp4":"2effd36d9eee1df2","media/aula/pop-section-153.visemes.json":"8542364e7054ec74","media/aula/pop-section-153.vtt":"f48f42f2d4e6ab10","media/aula/pop-section-154.jpg":"1a67eb63d19e0efa","media/aula/pop-section-154.mp4":"f82e299a87d09740","media/aula/pop-section-154.visemes.json":"36592960662b423f","media/aula/pop-section-154.vtt":"08daef595354b3f1","media/aula/pop-section-155.jpg":"aa35650713ae472f","media/aula/pop-section-155.mp4":"32b10163ec4bebae","media/aula/pop-section-155.visemes.json":"9e0c5efe82a61415","media/aula/pop-section-155.vtt":"99c1db51455f05e8","media/aula/pop-section-156.jpg":"dbf152a9ebbbdda2","media/aula/pop-section-156.mp4":"e3eb90bcfaf95b62","media/aula/pop-section-156.visemes.json":"7a9d1b754df512d6","media/aula/pop-section-156.vtt":"b6fcb2dc480a2c37","media/aula/pop-section-157.jpg":"0d430c10a9747775","media/aula/pop-section-157.mp4":"2ec1b1a56655b25c","media/aula/pop-section-157.visemes.json":"67994abd6c6397a3","media/aula/pop-section-157.vtt":"b81cdaedf5ce9d67","media/aula/pop-section-158.jpg":"0f3ca4dd08ae71e8","media/aula/pop-section-158.mp4":"5185647d4ec3d329","media/aula/pop-section-158.visemes.json":"002fcea6f7fa03cc","media/aula/pop-section-158.vtt":"8ba8a6b96f094bc0","media/aula/pop-section-159.jpg":"e1bb9444ead833cc","media/aula/pop-section-159.mp4":"a1f35cf632741146","media/aula/pop-section-159.visemes.json":"482d5f7cebdadaac","media/aula/pop-section-159.vtt":"17b9c0c5b885ab26","media/aula/pop-section-160.jpg":"b2b3466c5c1785a2","media/aula/pop-section-160.mp4":"a732571b09ef4e96","media/aula/pop-section-160.visemes.json":"a693effdcccf5858","media/aula/pop-section-160.vtt":"d5808744e79087f8","media/aula/pop-section-161.jpg":"b4cc159174cf00de","media/aula/pop-section-161.mp4":"fe1166b0672c65d9","media/aula/pop-section-161.visemes.json":"f7c9e858685cb4af","media/aula/pop-section-161.vtt":"096876308dfe4047","media/aula/pop-section-168.jpg":"7f48fca17d5f24b1","media/aula/pop-section-168.mp4":"f6779588ce00afb9","media/aula/pop-section-168.visemes.json":"6f2593e6d0608849","media/aula/pop-section-168.vtt":"509dacc9159d15df","media/aula/pop-section-169.jpg":"a697b64868193bf4","media/aula/pop-section-169.mp4":"b00d73fd28dfb525","media/aula/pop-section-169.visemes.json":"03f41c4e5dc9213b","media/aula/pop-section-169.vtt":"18bb8b02b3efa57d","media/aula/pop-section-170.jpg":"09ff7bc445bf2892","media/aula/pop-section-170.mp4":"a140b737b7fd50f7","media/aula/pop-section-170.visemes.json":"a6df82019674ec43","media/aula/pop-section-170.vtt":"8b382e2124a07481","media/aula/pop-section-171.jpg":"2bc4ca488350572e","media/aula/pop-section-171.mp4":"4fcd4435b90cb383","media/aula/pop-section-171.visemes.json":"06d4ec1746a2491a","media/aula/pop-section-171.vtt":"20d2ec41ab328704","media/aula/pop-section-172.jpg":"e3cf9a9c2da9ce0c","media/aula/pop-section-172.mp4":"6133924c7b368a7b","media/aula/pop-section-172.visemes.json":"860731cd57cd06ad","media/aula/pop-section-172.vtt":"46c5099d217a65a0","media/aula/pop-section-173.jpg":"d5fb761cd2986b6c","media/aula/pop-section-173.mp4":"5f0aa38a994df348","media/aula/pop-section-173.visemes.json":"d8b7379cacaa68db","media/aula/pop-section-173.vtt":"0bcfbf91a923b0c4","media/aula/pop-section-174.jpg":"b9c76fbfffb80d5c","media/aula/pop-section-174.mp4":"cc289dc26d8cfa13","media/aula/pop-section-174.visemes.json":"b8eb01cdd93e47e8","media/aula/pop-section-174.vtt":"b1b6d2f603a251df","media/aula/pop-section-175.jpg":"925bca9c8dda914f","media/aula/pop-section-175.mp4":"d12b26a3dd6c9188","media/aula/pop-section-175.visemes.json":"1db7311b51deb78e","media/aula/pop-section-175.vtt":"defd2991446294e3","media/aula/pop-section-176.jpg":"86ce1b8aace41565","media/aula/pop-section-176.mp4":"78830fceef44c3e2","media/aula/pop-section-176.visemes.json":"355dc8a8e08dc1bf","media/aula/pop-section-176.vtt":"31570950fd11e4df","media/aula/pop-section-177.jpg":"ae431adb76654669","media/aula/pop-section-177.mp4":"d069a933d0a47f85","media/aula/pop-section-177.visemes.json":"9bb61fb1b375fe69","media/aula/pop-section-177.vtt":"ff59d7fad3f3e38e","media/aula/pop-section-178.jpg":"2fea6473c49b5fc1","media/aula/pop-section-178.mp4":"d16e2acbaf4c3ec6","media/aula/pop-section-178.visemes.json":"19b6225ef5590f12","media/aula/pop-section-178.vtt":"eb0b547ed1e9d1b9","media/aula/pop-section-179.jpg":"e817ae4bfbe045c6","media/aula/pop-section-179.mp4":"26527f108f596315","media/aula/pop-section-179.visemes.json":"eceabb2a512f2afc","media/aula/pop-section-179.vtt":"356710fad7753a5f","media/aula/pop-section-180.jpg":"030c7fa2413b3be9","media/aula/pop-section-180.mp4":"ca7aabfc077ca7c6","media/aula/pop-section-180.visemes.json":"756e3a17a5e672d4","media/aula/pop-section-180.vtt":"9ab5ba16dd54ac4b","media/aula/pop-section-181.jpg":"fa7d883179c0a8fc","media/aula/pop-section-181.mp4":"cb0d08c53db87efe","media/aula/pop-section-181.visemes.json":"91b7186a1b2676a8","media/aula/pop-section-181.vtt":"30c89d3ccf55c4db","media/aula/pop-section-182.jpg":"dc0d1635c81c612d","media/aula/pop-section-182.mp4":"279661d487f01085","media/aula/pop-section-182.visemes.json":"472c42abe5342897","media/aula/pop-section-182.vtt":"e74ec9aa0b732893","media/aula/pop-section-183.jpg":"457e3d186b89a5c9","media/aula/pop-section-183.mp4":"fa906c9d7769306f","media/aula/pop-section-183.visemes.json":"cae8642c5df8d47a","media/aula/pop-section-183.vtt":"2aab3cdb668ad823","media/enquadramento-poster.png":"9e47d6cc2985d5be","media/enquadramento.mp4":"61643702aee784cc","media/enquadramento.svg":"05563f58b655079f","media/enquadramento.vtt":"3bf4c61e982d9763","media/fluxo-geral-poster.png":"9508c06744ed1d54","media/fluxo-geral.mp4":"018b5494d48472e8","media/fluxo-geral.svg":"4491da25e90fdc6b","media/fluxo-geral.vtt":"b25a319cc1cdb6c6","media/learning-stage/professor-sprite.webp":"b5aea6aaa0ba368b","media/learning-stage/professor-visemes-v2.png":"ef077fddc5e5141e","media/learning-stage/professor-visemes-v2.webp":"5a256fdd0449fb89","media/learning-stage/thematic-atlas.webp":"1800c76226a8f9c3","media/m00-poster.png":"bc0bacf49f4ecb1b","media/m00.mp4":"c06260af09b82284","media/m00.vtt":"ac1594ab7b281b43","media/m01-poster.png":"7a540bb834b9e682","media/m01.mp4":"260788902bd427b5","media/m01.vtt":"17b17b41859a0608","media/m02-poster.png":"1b44f6fd78c2f510","media/m02.mp4":"2828384dd1b101bb","media/m02.vtt":"f58e008f380f66e9","media/m03-poster.png":"179a14224fff7cbd","media/m03.mp4":"5fc636ab34cc4c73","media/m03.vtt":"50f33d41c369f09c","media/m04-poster.png":"397334608620df6d","media/m04.mp4":"67882e1772ec085e","media/m04.vtt":"bab29addcb138710","media/m05-poster.png":"9b483e05faf7aa9c","media/m05.mp4":"ca6ed0c257749f10","media/m05.vtt":"4f0e5ed829668e6f","media/m06-poster.png":"74ca37a4a6d5843d","media/m06.mp4":"a67926e08092aafa","media/m06.vtt":"3780a32d9c9cb0b4","media/m07-poster.png":"41c799d72b498530","media/m07.mp4":"55023395e3b2f7f8","media/m07.vtt":"61b797ad3a6d83b5","media/m08-poster.png":"720d3b3885b706a6","media/m08.mp4":"4965fbbe9d3eaef9","media/m08.vtt":"f089474e3f4429f1","media/m09-poster.png":"bc2fcd6dbb385e94","media/m09.mp4":"1b45ca5b834082ac","media/m09.vtt":"8c531184c56c39b1","media/m10-poster.png":"979b9063e9ba0bd9","media/m10.mp4":"ea81c391ca69cddc","media/m10.vtt":"897195b03c968839","media/m11-poster.png":"fdd935d7d28ec19e","media/m11.mp4":"07c64548e51a7674","media/m11.vtt":"51765a9b0ca70681","media/m12-poster.png":"13d969e7044d41e8","media/m12.mp4":"ecdb83d952aa5df6","media/m12.vtt":"6443e58816907666","media/m13-poster.png":"c8e2704350ba2738","media/m13.mp4":"b9dc1ead8ff2212e","media/m13.vtt":"7bd1fcfc433464e8","media/m14-poster.png":"39d82184a0606513","media/m14.mp4":"dacb9017dfc1eff3","media/m14.vtt":"f8bcf0012b7a6006","media/m15-poster.png":"4b45193c78632a5e","media/m15.mp4":"81122f1018cf5725","media/m15.vtt":"c06a16731eecd1e3","media/m16-poster.png":"d5582292642ac625","media/m16.mp4":"e95003477ec1fc98","media/m16.vtt":"10cb1140ed68e535","media/media-manifest.json":"5f88d5daabea0732","media/pacuera-poster.png":"4b9c3532d64516de","media/pacuera.mp4":"d5e57fae1613ca55","media/pacuera.svg":"2b34979afc2e0815","media/pacuera.vtt":"6be9ec65f3a5ba32","media/piloto/manifest.json":"98bd405217b0c0b0","media/piloto/pop-section-018.jpg":"ec4a00392da3804f","media/piloto/pop-section-018.mp4":"066755188f968c48","media/piloto/pop-section-018.txt":"d77b3ebff18176c6","media/piloto/pop-section-018.visemes.json":"fc43ff20817790dc","media/piloto/pop-section-018.vtt":"9e02cc9191369609","media/piloto/pop-section-059.jpg":"7f729bc0d999dc4d","media/piloto/pop-section-059.mp4":"078d25a75274879e","media/piloto/pop-section-059.txt":"445156b41020d1cf","media/piloto/pop-section-059.visemes.json":"c3f7e6304926c9bf","media/piloto/pop-section-059.vtt":"90e3063869f58606","media/piloto/pop-section-069.jpg":"a78872c0f82e1d2d","media/piloto/pop-section-069.mp4":"686b6b49eed8a5da","media/piloto/pop-section-069.txt":"ccffa283f6eec2ec","media/piloto/pop-section-069.visemes.json":"5ae6103be5b824a7","media/piloto/pop-section-069.vtt":"924376841ec20b72","media/piloto/pop-section-094.jpg":"fff4e38e0f38ef4b","media/piloto/pop-section-094.mp4":"8cc36d01024aa7bd","media/piloto/pop-section-094.txt":"6797b5d6eed5b930","media/piloto/pop-section-094.visemes.json":"b3b8b13331213b06","media/piloto/pop-section-094.vtt":"da12cc73419fe80a","media/piloto/pop-section-108.jpg":"6a04b5cac6a90595","media/piloto/pop-section-108.mp4":"df92341d327d11b6","media/piloto/pop-section-108.txt":"8400ecf89bf2ff98","media/piloto/pop-section-108.visemes.json":"a5aa0ae06b62ad41","media/piloto/pop-section-108.vtt":"667c6e98f2f86868","media/piloto/pop-section-134.jpg":"b131a0f8b333e993","media/piloto/pop-section-134.mp4":"a32f8a962848915f","media/piloto/pop-section-134.txt":"1d63246075d4de5d","media/piloto/pop-section-134.visemes.json":"95b8e89e84573788","media/piloto/pop-section-134.vtt":"eb119760e2a7d413","media/piloto/provenance.json":"0c527d8ff382fde0","media/tour-usina-poster.png":"5accad0ff909ba01","media/tour-usina.mp4":"fac483326c0072f2","media/tour-usina.vtt":"35c6c231fb32ad4b","source-assets/asset-manifest.json":"746faa752a1f15da","source-assets/flow-image-001.png":"208ea985e008f39b","source-assets/flow-image-002.png":"79a8e9b8b2e6a3e5","source-assets/flow-image-003.png":"29df83d18cc8c631","source-assets/flow-image-004.png":"d59a6be90cfa01ad","source-assets/flow-image-005.png":"6e97cef276820e69","source-assets/flow-image-006.png":"3ab6202fd3f40f8b","source-assets/flow-image-007.png":"35fc85296a96b4cd","source-assets/flow-image-008.png":"096807789452730f","source-assets/flow-image-009.png":"884fa0b464778caa","source-assets/flow-image-010.png":"8e834813a8e93d44","source-assets/flow-image-011.png":"9c690b165e6a0693","source-assets/flow-image-012.png":"b5e740c262a8dc40","source-assets/flow-image-013.png":"00a3bd8c50c5a1e7","source-assets/flow-image-014.png":"b9cac83516e534a5","source-assets/flow-image-015.png":"8164c33111c5cb4e","source-assets/flow-image-016.png":"68ee6824db2c2cbe","source-assets/flow-image-017.png":"e54f06d839c38c77","source-assets/flow-image-018.png":"685732c43ddcf06b","source-assets/flow-image-019.png":"67b3319e2e3b62fd","source-assets/flow-image-020.png":"ff666afe5a736cdf","source-assets/flow-image-021.png":"3dac46e269b06d76","source-assets/pop-image-001.png":"3bbe09d62a6ae6a1","source-assets/pop-image-002.png":"7103a9b2056720df","source-assets/pop-image-003.png":"55f362ecb646863e","source-assets/pop-image-004.png":"6c619bcef80b5965","source-assets/pop-image-005.png":"20529379642a11b4","source-assets/pop-image-006.png":"7e3b148349d20945","source-assets/pop-image-007.png":"de37652eff2ddfa7","source-assets/pop-image-008.png":"1388350597b4aed9","source-assets/pop-image-009.png":"4da2c6c282fe2211","source-assets/pop-image-010.png":"260b9c48a9e451c1","source-assets/pop-image-011.png":"4997c4ae857395cc","source-assets/pop-image-012.png":"aa326dca8ffec405","source-assets/pop-image-013.png":"0e6dabfeee080dbf","source-assets/pop-image-014.png":"9448e5de03bf4907"};
const INDEX_URL = new URL(BASE + 'index.html', self.location.origin).href;
const META_MIDIA_URL = new URL(BASE + '__pwa/revisoes-midia.json', self.location.origin).href;
// navigator.onLine pode voltar a true numa pagina que acabou de nascer de
// um fallback do Service Worker (isso ocorre inclusive no Chromium). O estado
// observado pela navegacao network-first e mais fiel e pode ser consultado
// pela interface logo depois do carregamento.
let ULTIMA_CONEXAO_DA_NAVEGACAO = null;
let ULTIMA_CONEXAO_DA_NAVEGACAO_EM = null;

function serializarErro(erro, codigoPadrao) {
  const nome = erro && erro.name ? String(erro.name) : '';
  const mensagem = erro && erro.message ? String(erro.message) : String(erro || 'Erro desconhecido');
  const quota = nome === 'QuotaExceededError' || /quota|storage|armazenamento/i.test(mensagem);
  return {
    codigo: quota ? 'QUOTA_EXCEEDED' : codigoPadrao,
    mensagem,
  };
}

async function publicar(tipo, dados = {}) {
  try {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const cliente of janelas) {
      cliente.postMessage({ origem: APP_ID, tipo, versao: VERSAO, ...dados });
    }
  } catch {
    // Uma falha de telemetria local nunca deve impedir o funcionamento offline.
  }
}

function responderMensagem(evento, mensagem) {
  const destino = evento.ports && evento.ports[0] ? evento.ports[0] : evento.source;
  if (destino && typeof destino.postMessage === 'function') destino.postMessage(mensagem);
}

function estaNoEscopo(url) {
  return url.origin === self.location.origin &&
    (BASE === '/' || url.pathname.startsWith(BASE));
}

function ehEntradaDaAplicacao(url) {
  const entrada = new URL(INDEX_URL);
  const raiz = new URL(BASE, self.location.origin);
  return url.origin === entrada.origin &&
    (url.pathname === entrada.pathname || url.pathname === raiz.pathname);
}

function caminhoNoEscopo(url) {
  return BASE === '/' ? url.pathname.replace(/^\/+/, '') : url.pathname.slice(BASE.length);
}

function ehMidia(url) {
  return estaNoEscopo(url) && /^(media|hidro|source-assets)\//.test(caminhoNoEscopo(url));
}

function pedidoCompleto(request) {
  const headers = new Headers(request.headers);
  headers.delete('range');
  headers.delete('if-range');
  return new Request(request, { headers, cache: 'no-store' });
}

function pedidoCompletoDaUrl(url) {
  return new Request(url.href, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}

function validarUrlDeMidia(valor) {
  const url = new URL(String(valor), self.location.origin);
  if (!ehMidia(url)) throw new Error('URL fora das pastas de mídia da Academia IAT.');
  return url;
}

async function guardarRespostaCompleta(cache, request, response) {
  if (!response.ok || response.status !== 200) {
    throw new Error('A origem não forneceu o arquivo completo (HTTP ' + response.status + ').');
  }
  try {
    await cache.put(request, response.clone());
  } catch (erro) {
    const detalhe = serializarErro(erro, 'MEDIA_CACHE_WRITE_FAILED');
    await publicar('IAT_PWA_ERROR', {
      etapa: 'cache-midia',
      url: request.url,
      ...detalhe,
    });
    throw Object.assign(new Error(detalhe.mensagem), { code: detalhe.codigo });
  }
  const verificacao = await cache.match(request, { ignoreVary: true });
  if (!verificacao || verificacao.status !== 200) {
    throw Object.assign(new Error('O arquivo não pôde ser confirmado no armazenamento offline.'), {
      code: 'MEDIA_CACHE_VERIFY_FAILED',
    });
  }
}

async function respostaParcial(request, respostaCompleta) {
  const cabecalho = request.headers.get('range');
  const corpo = await respostaCompleta.arrayBuffer();
  const tamanho = corpo.byteLength;
  const correspondencia = /^bytes=(\d*)-(\d*)$/i.exec((cabecalho || '').trim());
  if (!correspondencia || (!correspondencia[1] && !correspondencia[2])) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
    });
  }

  let inicio;
  let fim;
  if (!correspondencia[1]) {
    const sufixo = Number(correspondencia[2]);
    if (!Number.isFinite(sufixo) || sufixo <= 0) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
      });
    }
    inicio = Math.max(0, tamanho - sufixo);
    fim = tamanho - 1;
  } else {
    inicio = Number(correspondencia[1]);
    fim = correspondencia[2] ? Number(correspondencia[2]) : tamanho - 1;
  }

  if (!Number.isFinite(inicio) || !Number.isFinite(fim) ||
      inicio < 0 || inicio >= tamanho || fim < inicio) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
    });
  }
  fim = Math.min(fim, tamanho - 1);

  const headers = new Headers(respostaCompleta.headers);
  headers.delete('content-encoding');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', 'bytes ' + inicio + '-' + fim + '/' + tamanho);
  headers.set('Content-Length', String(fim - inicio + 1));
  return new Response(corpo.slice(inicio, fim + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
}

async function reconciliarRevisoesDeMidia() {
  const cache = await caches.open(CACHE_MIDIA);
  let anteriores = {};
  try {
    const respostaAnterior = await cache.match(META_MIDIA_URL, { ignoreVary: true });
    if (respostaAnterior) anteriores = await respostaAnterior.json();
  } catch {
    anteriores = {};
  }

  const chaves = await cache.keys();
  for (const chave of chaves) {
    if (chave.url === META_MIDIA_URL) continue;
    const url = new URL(chave.url);
    const relativo = caminhoNoEscopo(url);
    const revisaoAtual = REVISOES_MIDIA[relativo];
    const revisaoAnterior = anteriores[relativo];
    // Mídia removida do build não deve sobreviver para sempre. Uma mídia sem
    // metadado anterior é preservada por segurança; pode ter sido baixada por
    // uma versão que antecede este mecanismo.
    if (!revisaoAtual || (revisaoAnterior && revisaoAnterior !== revisaoAtual)) {
      await cache.delete(chave, { ignoreVary: true });
    }
  }

  try {
    await cache.put(META_MIDIA_URL, new Response(JSON.stringify(REVISOES_MIDIA), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (erro) {
    await publicar('IAT_PWA_ERROR', {
      etapa: 'revisoes-midia',
      ...serializarErro(erro, 'MEDIA_REVISION_WRITE_FAILED'),
    });
  }
}

async function estadoDosCaches(urlConsultada, urlsConsultadas) {
  const nomes = await caches.keys();
  const cacheNucleo = await caches.open(CACHE_NUCLEO);
  const cacheMidia = await caches.open(CACHE_MIDIA);
  const chaves = (await cacheMidia.keys()).filter((chave) => chave.url !== META_MIDIA_URL);
  let bytesConhecidos = 0;
  let itensSemTamanho = 0;

  for (const chave of chaves) {
    const resposta = await cacheMidia.match(chave, { ignoreVary: true });
    const tamanho = Number(resposta && resposta.headers.get('content-length'));
    if (Number.isFinite(tamanho) && tamanho >= 0) bytesConhecidos += tamanho;
    else itensSemTamanho += 1;
  }

  let urlGuardada;
  if (urlConsultada) {
    const url = validarUrlDeMidia(urlConsultada);
    urlGuardada = Boolean(await cacheMidia.match(pedidoCompletoDaUrl(url), { ignoreVary: true }));
  }
  const urlsGuardadas = {};
  const consultas = [...new Set(
    (Array.isArray(urlsConsultadas) ? urlsConsultadas : []).map(String),
  )].slice(0, 700);
  for (const item of consultas) {
    const url = validarUrlDeMidia(item);
    urlsGuardadas[item] = Boolean(
      await cacheMidia.match(pedidoCompletoDaUrl(url), { ignoreVary: true }),
    );
  }

  return {
    versao: VERSAO,
    base: BASE,
    conexaoDaUltimaNavegacao: ULTIMA_CONEXAO_DA_NAVEGACAO,
    conexaoDaUltimaNavegacaoEm: ULTIMA_CONEXAO_DA_NAVEGACAO_EM,
    nucleoPronto: Boolean(await cacheNucleo.match(INDEX_URL, { ignoreVary: true })),
    cacheDaAplicacao: nomes.filter((nome) => nome.startsWith(CACHE_PREFIX)),
    midia: {
      itens: chaves.length,
      bytesConhecidos,
      itensSemTamanho,
      urlGuardada,
      urlsGuardadas,
    },
  };
}

async function baixarMidias(evento, urls, forcarRede) {
  const lista = [...new Set((Array.isArray(urls) ? urls : []).map(String))].slice(0, 700);
  const cache = await caches.open(CACHE_MIDIA);
  const resultados = [];

  for (let indice = 0; indice < lista.length; indice += 1) {
    const valor = lista[indice];
    try {
      const url = validarUrlDeMidia(valor);
      const request = pedidoCompletoDaUrl(url);
      const existente = await cache.match(request, { ignoreVary: true });
      let origem = 'cache';
      if (!existente || forcarRede) {
        const resposta = await fetch(request);
        await guardarRespostaCompleta(cache, request, resposta);
        origem = 'rede';
      }
      const confirmado = await cache.match(request, { ignoreVary: true });
      if (!confirmado) throw Object.assign(new Error('Verificação do download falhou.'), {
        code: 'MEDIA_CACHE_VERIFY_FAILED',
      });
      resultados.push({ url: url.href, ok: true, origem });
    } catch (erro) {
      const detalhe = serializarErro(erro, erro && erro.code ? erro.code : 'MEDIA_DOWNLOAD_FAILED');
      resultados.push({ url: valor, ok: false, ...detalhe });
    }
    responderMensagem(evento, {
      tipo: 'IAT_MEDIA_PROGRESS',
      atual: indice + 1,
      total: lista.length,
      resultado: resultados[resultados.length - 1],
    });
  }

  const falhas = resultados.filter((item) => !item.ok);
  responderMensagem(evento, {
    tipo: 'IAT_RESPONSE',
    ok: true,
    resultado: {
      ok: falhas.length === 0,
      solicitados: lista.length,
      baixados: resultados.length - falhas.length,
      falhas,
      resultados,
      verificacao: await estadoDosCaches(),
    },
  });
}

async function removerMidias(urls, removerTodas = false) {
  if (removerTodas) {
    await caches.delete(CACHE_MIDIA);
    await caches.open(CACHE_MIDIA);
    return { removidos: 'todos' };
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    throw Object.assign(new Error('Informe as mídias a remover ou confirme a limpeza total.'), {
      code: 'MEDIA_REMOVE_LIST_EMPTY',
    });
  }
  const cache = await caches.open(CACHE_MIDIA);
  let removidos = 0;
  for (const valor of [...new Set(urls.map(String))]) {
    const url = validarUrlDeMidia(valor);
    if (await cache.delete(pedidoCompletoDaUrl(url), { ignoreVary: true })) removidos += 1;
  }
  return { removidos };
}

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    const falhas = [];
    for (const caminho of PRECACHE) {
      const url = new URL(caminho, self.location.origin).href;
      try {
        const resposta = await fetch(new Request(url, { cache: 'reload' }));
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        await cache.put(url, resposta);
      } catch (erro) {
        falhas.push({ url, ...serializarErro(erro, 'PRECACHE_ITEM_FAILED') });
      }
    }
    if (falhas.length) {
      await caches.delete(CACHE_NUCLEO);
      await publicar('IAT_PWA_ERROR', {
        etapa: 'precache',
        codigo: 'PRECACHE_FAILED',
        mensagem: falhas.length + ' arquivo(s) essencial(is) não puderam ser armazenados.',
        falhas,
      });
      throw new Error('Precache incompleto: ' + falhas.map((item) => item.url).join(', '));
    }
    // Não chama skipWaiting: uma versão nova permanece esperando a confirmação.
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes
      .filter((nome) => nome.startsWith(CACHE_NUCLEO_PREFIX) && nome !== CACHE_NUCLEO)
      .map((nome) => caches.delete(nome)));
    // CACHE_MIDIA é deliberadamente estável e caches de outros apps não são tocados.
    await reconciliarRevisoesDeMidia();
    await self.clients.claim();
    await publicar('IAT_PWA_ACTIVATED', { cacheNucleo: CACHE_NUCLEO });
  })());
});

self.addEventListener('fetch', (evento) => {
  const request = evento.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!estaNoEscopo(url)) return;

  if (request.mode === 'navigate') {
    evento.respondWith((async () => {
      try {
        const resposta = await fetch(request);
        ULTIMA_CONEXAO_DA_NAVEGACAO = 'online';
        ULTIMA_CONEXAO_DA_NAVEGACAO_EM = Date.now();
        const tipo = resposta.headers.get('content-type') || '';
        if (resposta.ok && ehEntradaDaAplicacao(url) && tipo.includes('text/html')) {
          try {
            const cache = await caches.open(CACHE_NUCLEO);
            await cache.put(INDEX_URL, resposta.clone());
          } catch (erro) {
            const detalhe = serializarErro(erro, 'CORE_SHELL_WRITE_FAILED');
            await publicar('IAT_PWA_ERROR', {
              etapa: 'cache-shell',
              ...detalhe,
              mensagem: 'A página abriu pela rede, mas a atualização do shell offline falhou.',
              url: request.url,
            });
          }
        }
        return resposta;
      } catch {
        ULTIMA_CONEXAO_DA_NAVEGACAO = 'offline';
        ULTIMA_CONEXAO_DA_NAVEGACAO_EM = Date.now();
        const cache = await caches.open(CACHE_NUCLEO);
        return (await cache.match(INDEX_URL, { ignoreVary: true })) ||
          new Response('<!doctype html><html lang="pt-BR"><title>Academia IAT indisponível</title><p>O núcleo offline ainda não foi concluído. Reconecte-se e tente novamente.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
      }
    })());
    return;
  }

  if (ehMidia(url)) {
    const processo = (async () => {
      const cache = await caches.open(CACHE_MIDIA);
      const completo = pedidoCompleto(request);
      const guardado = await cache.match(completo, { ignoreVary: true });

      if (guardado) {
        return {
          resposta: request.headers.has('range')
            ? await respostaParcial(request, guardado)
            : guardado,
        };
      }

      const cacheNucleo = await caches.open(CACHE_NUCLEO);
      const guardadoNoNucleo = await cacheNucleo.match(request, { ignoreVary: true });
      if (guardadoNoNucleo) {
        return {
          resposta: request.headers.has('range')
            ? await respostaParcial(request, guardadoNoNucleo)
            : guardadoNoNucleo,
        };
      }

      try {
        // Reprodução normal preserva Range e não transforma uma visualização
        // on-line em download persistente. O cache de mídia só é preenchido
        // pelo comando explícito IAT_CACHE_MEDIA.
        return { resposta: await fetch(request) };
      } catch (erroRede) {
        const detalhe = serializarErro(erroRede, 'MEDIA_OFFLINE_MISS');
        await publicar('IAT_PWA_ERROR', {
          etapa: 'buscar-midia',
          url: request.url,
          ...detalhe,
        });
        return {
          resposta: new Response('', {
            status: 504,
            statusText: 'Mídia não disponível offline',
            headers: { 'X-Academia-IAT-Offline': 'media-miss' },
          }),
        };
      }
    })();
    evento.respondWith(processo.then(({ resposta }) => resposta));
    evento.waitUntil(processo.then(() => undefined));
    return;
  }

  evento.respondWith((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    const guardado = await cache.match(request, { ignoreVary: true });
    if (guardado) return guardado;
    try {
      const resposta = await fetch(request);
      if (resposta.ok && caminhoNoEscopo(url).startsWith('assets/')) {
        try {
          await cache.put(request, resposta.clone());
        } catch (erro) {
          await publicar('IAT_PWA_ERROR', {
            etapa: 'cache-nucleo-runtime',
            url: request.url,
            ...serializarErro(erro, 'CORE_CACHE_WRITE_FAILED'),
          });
        }
      }
      return resposta;
    } catch {
      return new Response('', { status: 504, statusText: 'Recurso indisponível offline' });
    }
  })());
});

self.addEventListener('message', (evento) => {
  const dados = evento.data || {};
  if (dados.tipo === 'IAT_ACTIVATE_UPDATE') {
    evento.waitUntil(Promise.resolve(self.skipWaiting())
      .then(() => responderMensagem(evento, {
        tipo: 'IAT_UPDATE_ACCEPTED', ok: true, versao: VERSAO,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_UPDATE_ACCEPTED',
        ok: false,
        erro: serializarErro(erro, 'UPDATE_ACTIVATION_FAILED'),
      })));
    return;
  }
  if (dados.tipo === 'IAT_GET_STATUS') {
    evento.waitUntil(estadoDosCaches(dados.url, dados.urls)
      .then((resultado) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: true, resultado,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: false,
        erro: serializarErro(erro, 'STATUS_FAILED'),
      })));
    return;
  }
  if (dados.tipo === 'IAT_CACHE_MEDIA') {
    evento.waitUntil(baixarMidias(evento, dados.urls, Boolean(dados.forcarRede)));
    return;
  }
  if (dados.tipo === 'IAT_REMOVE_MEDIA') {
    evento.waitUntil(removerMidias(dados.urls, dados.removerTodas === true)
      .then((resultado) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: true, resultado,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: false,
        erro: serializarErro(erro, 'MEDIA_REMOVE_FAILED'),
      })));
  }
});
