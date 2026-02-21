import { SpellingWord, Difficulty } from '../types';

const grade2to4Raw = `
WORD	PRONUNCIATION	MEANING	ORIGIN	SENTENCE	P.S
Jogging	/ˈdʒɒɡ.ɪŋ/, /ˈdʒɑː.ɡɪŋ/	Running at a slow pace	Late Middle English 	Jogging in the park is part of my morning routine.	Noun
Delight 	dɪˈlaɪt 	to please greatly	Old French from Latin	It is another art deco gem and its story will delight music lovers.	Verb 
Magma	/ˈmæɡ.mə/	Molten rock beneath the Earth's surface	Greek 	The volcano erupted, releasing hot magma.	Noun
Briefcase	/ˈbriːf.keɪs/	A flat, portable case for carrying papers	English 	He carried his documents in a black leather briefcase.	Noun
Foreseen	/fɔːˈsiːn/, /fɔːrˈsiːn/	Predicted or anticipated	Old English 	The economic crisis had been foreseen.	Verb 
Deputy	/ˈdɛp.jʊ.ti/, /ˈdɛpjəti; ˈdɛpəti	A second-in-command or assistant	Old French 	The sheriff’s deputy arrested the suspect.	Noun
Mangrove	/ˈmæŋ.ɡrəʊv/, /ˈmæŋ.ɡroʊv/ ˈmæn ɡrəʊv	A tropical tree that grows in coastal waters	Portuguese 	The mangrove forests protect the coastline from erosion.	Noun
Squall	/skwɔːl/, / skwɔl	A sudden strong wind or storm	Scandinavian origin	A violent squall hit the coastline.	Noun
Elephant	/ˈɛ.lɪ.fənt ˈɛləfənt /	A large, gray mammal with a trunk	Greek 	The elephant splashed water with its trunk.	Noun
Integrity	/ɪnˈtɛɡ.rə.ti/, 	The quality of being honest and having strong moral principles	Latin 	His integrity made him a trusted leader.	Noun
Unsafe	/ʌnˈseɪf/	Not safe or dangerous	Old English 	The bridge looked unsafe after the storm.	Adjective
Arcade	/ɑːˈkeɪd/, /ɑːrˈkeɪd/	A covered passage with shops or game machines	French 	We played games at the arcade for hours.	Noun
Scheme	/skiːm/	A plan or system, often secret or dishonest	Greek 	The company introduced a new bonus scheme.	Noun, Verb
Cough	/kɒf/, /kɔːf/	To expel air from the lungs suddenly	Old English 	He had a bad cough due to the cold.	Noun
Hooves	/huːvz/, /hʊvz/	The hard feet of animals like horses or cows	Old English 	The horse’s hooves thundered on the ground.	Noun 
Chicken	/ˈtʃɪk.ɪn/	A domesticated bird; a cowardly person	Old English 	They had fried chicken for dinner.	Noun
Rocket	/ˈrɒk.ɪt/, /ˈrɑː.kɪt/	A vehicle that travels into space	Italian 	The rocket launched successfully into space.	Noun
Honeybee	/ˈhʌn.i.biː/	A type of bee that produces honey	Old English 	The honeybee pollinates flowers.	Noun
Scent	/sɛnt/	A pleasant smell or aroma	Latin 	The scent of roses filled the room.	Noun
Puzzles	/ˈpʌz.əlz/	Games or problems that require solving	Unknown origin	She enjoys solving jigsaw puzzles.	Noun
Jersey	/ˈdʒɜː.zi/, / ˈdʒɜrzi	A type of shirt; a breed of dairy cow	English 	He wore his team’s jersey to the game.	Noun
Tactics	/ˈtæk.tɪks/	Strategies used to achieve a goal	Greek 	The coach explained the team’s tactics before the match.	Noun
Shepherd	ˈʃɛpəd ˈʃɛpərd 	A person who herds sheep	Old English 	The shepherd led his flock to the pasture.	Noun
Rivalry	/ˈraɪ.vəl.ri/	Competition or conflict between opponents	Latin 	The rivalry between the two teams is intense.	Noun
Obvious	/ˈɒb.vi.əs/, 	Easily seen or understood	Latin 	It was obvious that he was lying.	Adjective
Cottage	/ˈkɒt.ɪdʒ/, 	A small house, typically in the countryside	Old French 	They spent the weekend at a cozy cottage.	Noun
Reflect	/rɪˈflɛkt/	To bounce back light or think deeply	Latin 	The mirror will reflect your image.	Verb
Comfort	/ˈkʌm.fət/, / ˈkʌmfərt	A state of physical or mental ease	Latin 	A warm blanket provides comfort in winter.	Noun
Sanitize Sanitise 	ˈsænɪˌtaɪz  / ˈsænəˌtaɪz	To clean and make free from germs	Latin 	It’s important to sanitize your hands before eating.	Verb
Cement	/sɪˈmɛnt/ səˈmɛnt	A building material used for construction	Latin 	The workers poured cement to build the sidewalk.	Noun
Dough	/dəʊ/ /doʊ/	Soft flour mixture used for baking	Old English 	She rolled out the cookie dough.	Noun
Strand	/strænd/ 	A single thin length of something	Old English 	A strand of hair fell on her face.	Noun
Ladle	/ˈleɪdl/ 	A big spoon used for serving soup	Old English 	Mom used a ladle to pour the soup.	Noun
Nibble	/ˈnɪbl/ 	To take small bites	Middle English 	The mouse began to nibble the cheese.	Verb
Sport	/spɔːt/ /spɔːrt/	A game or physical activity	Old French 	Soccer is my favorite sport.	Noun
Tractor	/ˈtræktə/ /ˈtræktər/	A powerful vehicle used for farming	Latin 	The farmer drove the tractor.	Noun
Wrinkle	ˈrɪŋkəl /ˈrɪŋkl/ 	A small line or fold in something	Middle English 	His shirt had a wrinkle.	Noun
Zipped	/zɪpt/ 	Fastened with a zipper	 of imitative origin	She zipped her jacket.	Verb
Theater / Theatre	/ˈθɪətə  / ˈθiətər /	A place for performances or movies	Greek 	They went to the theatre to watch a play.	Noun
Choose	/tʃuːz/	To select from options	Old English 	You must choose between the two options.	Verb
Drawer	/ ˈdrɔːə  ˈdrɔər; drɔr	A storage compartment in furniture	Old English 	She keeps her socks in the top drawer.	Noun
People	/ˈpiː.pəl/	Human beings in general	Latin 	The park was full of people.	Noun
Empty	/ˈɛmp.ti/	Containing nothing	Old English 	The bottle was empty after I drank the water.	Verb
Amulet	/ˈæm.jʊ.lɪt/, /ˈæm.jə.lɪt/	A charm thought to bring protection	Latin 	He wore an amulet for good luck.	Noun
Magician	/məˈdʒɪʃ.ən/	A person who performs magic tricks	Latin 	The magician amazed the audience.	Noun
Carrot	/ˈkær.ət/	An orange root vegetable	Late Latin 	She sliced a carrot for the salad.	Noun
Meteor	/ ˈmiːtɪə  / ˈmitiər; ˈmitˌi ɔr	A space rock that enters Earth's atmosphere	Greek 	We saw a meteor streak across the night sky.	Noun
Freight	/freɪt/	Goods transported by ship, truck, or train	Middle Dutch 	The freight train carried coal across the country.	Noun
Bought	/bɔːt	Past tense of "buy"; to have purchased	Old English 	He bought a new phone yesterday.	Verb
Holler	/ ˈhɒlə / ˈhɑlər	To shout loudly	Old English 	He had to holler to get their attention.	Verb
Chapter	/ˈtʃæptə / ˈtʃæptər	A section of a book or organization	Latin 	I just finished reading the first chapter.	Noun
Slither	ˈslɪðə ˈslɪðər	To move smoothly over a surface	Old English 	The snake slithered across the ground.	Verb
Tiptoe	/ˈtɪp.təʊ/, /ˈtɪp.toʊ/	To walk quietly on one's toes	Middle English 	She tiptoed past the sleeping baby.	Verb
Billboard	/ˈbɪl.bɔːd/, /ˈbɪl.bɔːrd/	A large outdoor sign for advertising	American English	The billboard displayed an ad for a new movie.	Noun
Picture	/ˈpɪktʃə / ˈpɪktʃər	An image or representation	Latin 	He took a picture of the sunset.	Noun
Trophy	/ˈtrəʊ.fi/, /ˈtroʊ.fi/	A prize for victory	Greek 	He won a trophy in the race.	Noun
Athlete	/ˈæθ.liːt/	A person skilled in sports	Greek 	She is a professional athlete.	Noun
Jotted	/ˈdʒɒt.ɪd/, 	Wrote down quickly	Latin iota	He jotted down some notes during class.	Verb
Chestnut	/ˈtʃɛs.nʌt/, ˈtʃɛstˌnʌt	A type of tree or edible nut	Old French 	She roasted chestnuts over the fire.	Noun
Swirled	/swɜːld/	Moved in a twisting, circular motion	Middle English 	The wind swirled the leaves around.	Verb
Toothpaste	/ˈtuːθ.peɪst/	A paste used to clean teeth	English 	He brushed his teeth with mint toothpaste.	Noun
Understand	/ˌʌn.dəˈstænd/, /ˌʌn.dɚˈstænd/	To comprehend something	Old English 	I don't understand this math problem.	Verb
Minivan	/ˈmɪn.i.væn/	A small passenger van	English 	They drove to the beach in a minivan.	Noun
Turkey	/ˈtɜː.ki/, /ˈtɝː.ki/	A large bird; a country in Europe/Asia	Named after Turkey 	We had roast turkey for dinner.	Noun
Friendship	/ˈfrɛnd.ʃɪp/	A close relationship between people	Old English 	Their friendship lasted for decades.	Noun
Window	/ˈwɪn.dəʊ/, /ˈwɪn.doʊ/	An opening in a wall with glass	Old Norse 	She opened the window to let in fresh air.	Noun
Sauce	/sɔːs/, /sɑːs/	A liquid or semi-liquid condiment	Latin 	He added tomato sauce to the pasta.	Noun
Tedious	/ˈtiːdiəs/ 	Too long, slow, or dull; tiresome.	From Latin 	The lecture was tedious and unengaging.	Adjective
Announce	/əˈnaʊns/ 	To make a public declaration about something.	Latin 	They announced the winner of the contest.	Verb
Enormous	/ɪˈnɔːməs/ /ɪˈnɔːrməs/	Very large in size, quantity, or extent.	From Latin 	The elephant is an enormous animal.	Adjective
Concentrate	/ˈkɒnsəntreɪt/ /ˈkɑːnsəntreɪt/	To focus one's attention or mental effort on a particular object or activity.	From Latin 	Please concentrate on your homework.	Verb
Termination	/ˌtɜːmɪˈneɪʃən/ /ˌtɜːrmɪˈneɪʃən/	The action of bringing something to an end.	From Latin 	The contract's termination was unexpected.	Noun
Confident	/ˈkɒnfɪdənt/ /ˈkɑːnfɪdənt/	Having a strong belief or assurance in oneself or one's abilities.	From Latin 	She felt confident about her presentation.	Adjective
Autumn	/ˈɔːtəm/ ˈɔtəm	The season between summer and winter; fall.	From Latin.	Leaves fall from trees in autumn.	Noun
Emergency	/ɪˈmɜːdʒənsi/ /ɪˈmɜːrdʒənsi/	A serious, unexpected situation requiring immediate action.	From Latin 	Call 911 in case of an emergency.	Noun
Thievery	/ˈθiːvəri/ /ˈθiːvəri/	The act of stealing; theft.	From Old English 	He was arrested for thievery.	Noun
Impression	/ɪmˈprɛʃən/ 	An effect, feeling, or image retained as a consequence of experience.	From Latin 	Her kindness made a lasting impression on me.	Noun
Encourage	/ɪnˈkʌrɪdʒ/ /ɪnˈkɜːrɪdʒ/ ɛnˈkɜrɪdʒ	To give support, confidence, or hope to someone.	From Old French 	Parents encourage their children to do well.	Verb
Frightened	/ˈfraɪtənd/ 	Afraid or anxious.	From Old English 	The loud noise frightened the cat.	Adjective
Improvement	/ɪmˈpruːvmənt/ /ɪmˈpruːvmənt/	The act or process of making something better.	From Latin 	There's been a noticeable improvement in his grades.	Noun
Furniture	/ˈfɜːnɪtʃə/ /ˈfɜːrnɪtʃər/	Large movable equipment used to make a room suitable for living or working.	From French 	The room was filled with antique furniture.	Noun
Rehearse	/rɪˈhɜːs/ /rɪˈhɜːrs/	To practice for a performance.	From Old French 	The actors rehearse their lines before the play.	Verb
Indelible	/ɪnˈdɛlɪbəl/ /ɪnˈdɛləbəl/	Impossible to remove or forget.	From Latin 	The experience left an indelible mark on her memory.	Adjective
Foundation	/faʊnˈdeɪʃən/ 	The base or groundwork of anything.	From Latin 	The foundation of the building is strong.	Noun
Requirement	/rɪˈkwaɪəmənt/ /rɪˈkwaɪərmənt/	Something that is needed or demanded.	From Latin 	A degree is a requirement for the job.	Noun
Lemonade	/ˌlɛməˈneɪd/ 	A drink made from lemon juice, water, and sugar.	From French 	She served cold lemonade on a hot day.	
Resources	/rɪˈzɔːsɪz , rɪˈsɔːsɪz	Supplies of materials, money, staff, and other assets.	From Old French 	Natural resources like water and minerals are vital.	Noun
Dinosaur	/ˈdaɪnəsɔː/ /ˈdaɪnəsɔːr/	A prehistoric reptile that lived millions of years ago.	From Greek 	The museum has a dinosaur skeleton.	Noun
Libel	/ˈlaɪbəl/ 	A published false statement that is damaging to a person's reputation; a written defamation.	From Latin 	The newspaper was sued for libel after publishing false information.	Noun
International	/ˌɪntəˈnæʃənl/ 	Existing or occurring between nations.	From Latin 	The Olympics is an international event.	Adjective
Abandon	/əˈbændən/	To leave completely and finally; forsake utterly; desert.	From Old French from Latin 	The sailors had to abandon the sinking ship.	Verb
Congressman	/ˈkɒŋɡresmən/, /ˈkɑːŋɡresmən/	A man who is a member of the US Congress.	English: 	The congressman gave a speech.	Noun
Dormitory	/ˈdɔː.mɪ.tər.i/ /ˈdɔːr.mə.tɔː.ri/	A large room where a number of people sleep, especially in a school or institution.	Latin 	The students returned to the dormitory after class.	Noun
Interrupt	/ˌɪntəˈrʌpt/ 	To stop someone from speaking by saying or doing something.	From Latin 	Please don't interrupt while I'm speaking.	Verb
Absorption	əbˈsɔːpʃən /əbˈzɔːpʃən/ 	The process of absorbing or being absorbed.	From Latin  	The sponge's absorption of water was impressive.	Noun
Connection	/kəˈnekʃən/	A link or relationship between people or things.	Latin 	The bridge is a connection between the towns.	Noun
Abstract	/ˈæbstrækt/ 	Existing in thought or as an idea but not having a physical existence.	From Latin 	Love is an abstract concept.	Adjective
Rumour rumor	/ ˈruːmə/ ˈrumər /	A story or statement that may not be true, spread among people.	Latin 	There’s a rumour that the store is closing.	Noun
Scenic	/ˈsiː.nɪk/	Having beautiful natural scenery.	Greek 	We took a scenic route through the mountains.	Adjective
Adjoin	/əˈdʒɔɪn/ 	To be next to or joined with.	From Latin 	The two rooms adjoin each other.	Verb
Dominant	ˈdɒmɪnənt ˈdɑmənənt 	Someone or something that is dominant is more powerful, successful, or noticeable.	Latin 	Lions are dominant predators in their habitat.	Adjective
Conservation	/ˌkɒnsəˈveɪʃən/, /ˌkɑːnsərˈveɪʃən/	The act of protecting or preserving something, especially the environment.	Latin 	Conservation helps save animals and trees.	Noun
Traitor	ˈtreɪtə / ˈtreɪtər	A person who betrays their country or friends.	Latin 	The traitor gave secrets to the enemy.	Noun
Underneath	/ˌʌn.dəˈniːθ/ / ˌʌndərˈniθ	Directly below something.	Old English 	The keys are underneath the couch.	Preposition
Consonant	/ˈkɒnsənənt/, 	A speech sound that is not a vowel.	Latin 	The letter ‘b’ is a consonant.	Noun
Remembrance	/rɪˈmem.brəns/	The act of remembering and showing respect.	Old French 	A day of remembrance was held for the fallen soldiers.	Noun
Maximum	/ˈmæk.sɪ.məm/	The greatest possible amount or level.	Latin 	The car can reach a maximum speed of 200 km/h.	Adjective/Noun
Horrific	/hɒˈrɪf.ɪk/ /həˈrɪf.ɪk/ hɔˈrɪfɪk	Extremely bad or frightening.	Latin 	The scene of the accident was horrific.	Adjective
Continent	/ˈkɒntɪnənt/, /ˈkɑːntənənt/	One of the seven large land masses on Earth.	Latin 	Africa is a continent.	Noun
Respectful	/rɪˈspekt.fəl/	Showing politeness and honor toward someone or something.	Latin 	She was always respectful to her teachers.	Adjective
Sponge	/spʌndʒ/	A soft, porous material used for cleaning.	Latin from Greek 	He wiped the table with a wet sponge.	Noun
Knowledge	/ˈnɒ.lɪdʒ/ /ˈnɑː.lɪdʒ/	Information, understanding, or skills gained through learning or experience.	Old English 	She has a wide knowledge of art history.	Noun
Laboratory	/ləˈbɒr.ə.tər.i/ /ˈlæb.rə.tɔːr.i/	A place where scientific research and experiments are done.	Medieval Latin 	He works in a chemical laboratory.	Noun
Strategy	ˈstrætɪdʒɪ /ˈstræt.ə.dʒi/	A plan of action designed to achieve a goal.	Greek 	We need a good strategy to win the game.	Noun
Material	/məˈtɪə.ri.əl/ /məˈtɪr.i.əl/	The substance from which something is made.	Latin 	Wood is a natural building material.	Noun
Hospitality	/ˌhɒs.pɪˈtæl.ə.ti/	Friendly and generous treatment of guests.	Latin 	Their hospitality made us feel at home.	Noun
Buffet	ˈbʊfeɪ /ˈbʌfeɪ/ ˈbʌfɪt  /	A meal where guests serve themselves.	From French 	The hotel offers a breakfast buffet every morning.	Noun
Distribute	/dɪˈstrɪb.juːt/	To distribute things means to hand them out or spread them around.	Latin "	Volunteers distribute food to the needy.	Verb
Landscape	/ˈlænd.skeɪp/	The visible features of an area of land.	Dutch 	The mountain landscape was breathtaking.	Noun
Newsstand	/ˈnjuːz.stænd/ /ˈnuːz.stænd/	A stall or small store that sells newspapers and magazines.		He bought a magazine at the newsstand.	Noun
Occurred	/əˈkɜːd/ /əˈkɝːd/	Happened; took place.	Latin 	The accident occurred late at night.	Verb
Language	/ˈlæŋ.ɡwɪdʒ/	A system of communication used by a particular community.	Latin 	English is a global language.	Noun
Museum	/mjuˈzɪə.m/	A building where objects of historical, scientific, or artistic interest are kept.	Greek 	We visited a dinosaur exhibit at the museum.	Noun
Ominous	/ˈɒm.ɪ.nəs/ /ˈɑmənəs /	Suggesting that something bad is going to happen.	Latin 	Dark clouds looked ominous before the storm.	Adjective
Legal	/ˈliː.ɡəl/	Allowed by law or relating to the law.	Latin 	He sought legal advice before signing the contract.	Adjective
Moisture	ˈmɔɪstʃə ˈmɔɪstʃər	Very small drops of water in the air or on a surface.	Latin 	The plant needs a bit of moisture to grow.	Noun
Precipitation	/prɪˌsɪp.ɪˈteɪ.ʃən/ prɪˌsɪpəˈteɪʃən	Rain, snow, or other forms of water falling from the sky.	Latin 	There was heavy precipitation overnight.	Noun
Broaden	/ˈbrɔːdən/ 	To make or become wider.	From Old English 	Traveling can broaden your perspective.	Verb
Multiply	/ˈmʌl.tɪ.plaɪ/	To increase in number by reproducing or combining.	Latin 	Bacteria multiply quickly in warm conditions.	Verb
Brochure	/ˈbrəʊʃə/ /broʊˈʃʊr/	A small booklet or pamphlet.	From French 	She read the travel brochure before booking the trip.	Noun
Drought	/draʊt/	A drought is a long period of time during which no rain falls.	Old English 	The crops failed due to the severe drought.	Noun
Aquaculture	ˈækwəˌkʌltʃə /ˈæk.wə.kʌl.tʃə(r)/	The farming of aquatic organisms such as fish or plants.	Latin 	Aquaculture is important for sustainable seafood.	Noun
Creole	/ˈkriː.əʊl/ ˈkriˌoʊl	A person or language of mixed European and local descent or origin, esp. Caribbean.	Spanish from Portuguese 	Creole cuisine is rich and flavourful.	Noun/Adjective
Duffel duffle	/ˈdʌf.əl/	A coarse woollen cloth; also, a large cylindrical bag.	Dutch 	He packed everything into his duffel bag.	Noun
Aquifer	ˈækwɪfə ˈækwəfər; ˈɑkwəfər	A layer of rock or soil that can hold and transmit water.	Latin 	The village gets its water from an underground aquifer.	Noun
Ensconced	/ɪnˈskɒnst/ /ɪnˈskɑːnst/	Settled securely or comfortably.	Possibly from Dutch 	She was ensconced in a cozy armchair.	Verb (past)
Furtive	/ˈfɜːtɪv / ˈfɜrtɪv	Attempting to avoid notice, typically due to guilt or secrecy.	From Latin 	She gave him a furtive glance before slipping away.	
Archbishop	/ˌɑːtʃˈbɪʃ.əp/ ˈɑrtʃˈbɪʃəp	A bishop of the highest rank.	Latin 	The archbishop led the ceremonial mass.	Noun
Gurney	/ˈɡɜː.ni/	A bed on wheels used in hospitals for moving sick or injured people.	Unknown origin 	The patient was wheeled into the operating room on a gurney.	Noun
Habitation	/ˌhæb.ɪˈteɪ.ʃən/	The act of living in a place or the place where someone lives.	From Latin 	Signs of human habitation were found in the cave.	Noun
Armament	/ˈɑː.mə.mənt/ /ˈɑːr.mə.mənt/	Military weapons and equipment.	Latin 	The country increased its armament during the conflict.	Noun
Blizzard	/ˈblɪz.əd/ ˈblɪzərd /	A severe snowstorm with strong winds.	Origin uncertain, American English	The blizzard closed roads across the region.	Noun
Demeanour demeanor	/dɪˈmiː.nə/ dɪˈminər	The way a person behaves toward others.	From Anglo-French 	Her calm demeanour helped ease the tension in the room.	Noun
Arousal	/əˈraʊ.zəl/	A state of being alert or stimulated.	The word has an obscure origin 	Sudden arousal from sleep startled him.	Noun
Encryption	/ɪnˈkrɪp.ʃən/	The process of converting data into code for security.	Greek 	The files were protected with encryption.	Noun
Gambit	/ˈɡæm.bɪt/	An action or set of actions carried out to gain an advantage in a situation or game.	From Spanish, from Italian 	His opening gambit in the negotiation was to offer a high price.	Noun
Artillery	/ɑːˈtɪl.ər.i/ /ɑːrˈtɪl.ɚ.i/	Large-calibre guns used in warfare.	Old French 	The artillery bombarded the enemy position.	Noun
Blackjack	/ˈblæk.dʒæk/	A card game in which players try to get 21 points.	Old English and Portuguese 	He won the round of blackjack with a perfect hand.	Noun
Dentistry	/ ˈdɛntɪstrɪ	The profession or science of treating teeth.	Latin 	He studied dentistry at university.	Noun
Ashtray	/ˈæʃ.treɪ/	A container for ash from cigarettes or cigars.	Old English 	He tapped his cigarette into the ashtray.	Noun
Gravitational	/ˌɡræv.ɪˈteɪ.ʃən.əl/	Relating to or resulting from the force of gravity.	From Latin 	The gravitational pull of the moon affects ocean tides.	Adjective
Behemoth	/bɪˈhiːmɒθ	Something enormous, especially a big and powerful organization.	Hebrew 	The tech company grew into a global behemoth.	Noun
Emissary	ˈɛmɪsərɪ ˈeməˌseri	A person sent on a special mission.	Latin 	The king sent an emissary to negotiate peace.	Noun
Gaudy	/ˈɡɔː.di/ / ˈɡɔːdɪ	Very brightly colored and showy, often in a tasteless or vulgar way.	From Middle English from Latin	She wore a gaudy dress covered in sequins.	Adjective
Astrodome	/ˈæs.trə.dəʊm/ ˈæstroʊˌdoʊm;	A domed stadium for sports or events, esp. the Houston Astrodome.	Greek 	The game was played in the Astrodome.	Noun
Celebratory	seləbreɪtəri /ˈsel.ə.brə.tɔː.ri	Involving celebration.	Latin 	They held a celebratory dinner after the win.	Adjective
Elongated	/ˈiː.lɒŋ.ɡeɪ.tɪd/	Stretched out in length.	Late Middle English from Late Latin	The shadows looked elongated at sunset.	Adjective
Genocide	/ˈdʒɛnəʊˌsaɪd	The deliberate murder of a whole community or race.	Greek from Latin 	The tribunal convicted the leader of genocide.	Noun
Cheddar	/ˈtʃed.ə(r)/	A type of hard cheese originally from Cheddar, England.	From Cheddar, a village in England	I added cheddar cheese to the sandwich.	Noun
Glacial	/ˈɡleɪsɪəl ˈɡleɪ.ʃəl/	Relating to or produced by glaciers or ice; extremely cold or slow.	From Latin 	Progress on the project has been at a glacial pace.	Adjective
Billionaire	/ˌbɪljəˈnɛə / ˌbɪljəˈnɛr	A person whose wealth is equal to or exceeds one billion units of currency.	French 	The billionaire donated money to charity.	Noun
Chilean	/ˈtʃɪl.i.ən/	Relating to Chile or its people.	Spanish 	The Chilean coast is famous for its seafood.	Adjective/Noun
Duplex	/ˈdjuː.pleks/ /ˈduː.pleks/	A house divided into two separate residences.	Latin 	They live in a duplex with their grandparents next door.	Noun
Eavesdrop	/ˈiːvz.drɒp/ /ˈiːvz.drɑːp/	To secretly listen to someone’s private conversation.	Middle English from Old English	He was caught eavesdropping on their meeting.	Verb
Christmastime	/ˈkrɪs.məs.taɪm/	The period around Christmas.	Middle English from Old English	Christmastime is full of joy and family gatherings.	Noun
Detectable	dɪtektəbəl	Able to be discovered or noticed.	Latin 	The gas leak was barely detectable.	Adjective
Genome genom	/ˈdʒiː.nəʊm/ /ˈdʒiː.noʊm/	The total genetic information present in a somatic cell and unique to any specific organism.	German 	Scientists have mapped the human genome.	Noun
Circumvent	/ˌsɜː.kəmˈvent/	To find a way around an obstacle or rule.	Latin 	He tried to circumvent the security system.	Verb
Biochemical	/ˌbaɪ.əʊˈkem.ɪ.kəl/	Relating to the chemical substances in living organisms.	Greek 	The scientists studied the biochemical reaction.	Adjective
Deplorable	/ dɪˈplɔːrəbəl/ dɪˈplɔrəbəl	Shockingly bad or unacceptable.	Latin 	The living conditions were absolutely deplorable.	Adjective
Cougar	/ˈkuː.ɡə(r)/	A large wild cat native to the Americas.	Portuguese, via French	A cougar was spotted in the national park.	Noun
Determinant	/ dɪˈtɜːmɪnənt dɪˈtɜrmɪnənt	A factor that decisively affects the outcome of something.	Latin 	Genetics is a key determinant of eye colour.	Noun
Electrode	/ɪˈlek.trəʊd/	A conductor through which electricity enters or leaves an object.	Greek 	The electrode was attached to the battery terminal.	Noun
Craggy	/ˈkræɡ.i/	Rough and uneven, especially in reference to rocks or facial features.	Middle English	The climber scaled the craggy mountain face.	Adjective
Despicable	/ dɪˈspɪkəbəl ˈdɛspɪkəbəl	Deserving hatred or contempt.	Latin 	Stealing from the poor is a despicable act.	Adjective
Creationism creatianism	/kriːˈeɪ.ʃən.ɪ.zəm/	The belief that the universe and life originated from specific acts of divine creation.	Middle English from Latin	Creationism is taught alongside evolution in some schools.	Noun
Dungeon	/ˈdʌn.dʒən/	A dark, underground prison, typically in a castle.	Old French 	The knight was thrown into the dungeon.	Noun
Auburn	ˈɔːbən ˈɔbərn	A reddish-brown colour.	Latin 	She had beautiful auburn hair.	Adjective/Noun
Carousel	ˌkærəˈsɛl /ˌkær.əˈ zɛl /	A rotating machine or device, especially at an airport or fairground.	French 	The luggage came around the airport carousel.	Noun
Derivative	dɪˈrɪvətɪv	Something that is based on another source; not original.	Latin 	The movie felt derivative of older classics.	Adjective/Noun
Editorial	/ˌed.ɪˈtɔː.ri.əl/ ɛdɪˈtɔriəl	An article giving opinions or perspectives in a publication.	from Late Latin	The newspaper published a harsh editorial.	Noun/Adjective
Gimmick	/ˈɡɪm.ɪk/	An unusual and unnecessary feature or action whose purpose is to attract attention or publicity.	Origin uncertain; possibly from US slang.	The free gift is just a marketing gimmick.	Noun
`;

const grade5to9Raw = `
WORD	PRONUNCIATION	MEANING	ORIGIN	SENTENCE	P.S
Alcalde	ælˈkældɪ 	A mayor or chief magistrate of a Spanish town or municipality.	Spanish, from Arabic 	The alcalde gave a speech during the town festival.	Noun
Chipotle	/tʃɪˈpəʊtleɪ/	A smoked and dried jalapeño pepper.	Spanish, 	The salsa was spicy because it had chipotle peppers.	Noun
Alfalfa	/ælˈfælfə/	A plant grown as food for livestock.	Spanish, from Arabic 	The farmer planted alfalfa to feed his cows.	Noun
Embargo	/ɛmˈbɑːɡəʊ ɪmˈbɑːɡəʊ/	An official ban on trade or other activity with a country.	Spanish 	The country placed an embargo on goods from its neighbour.	Noun
Alidade	/ˈælɪdeɪd/	A device used in surveying or astronomy to sight a distant object.	Medieval Latin, of Arabic origin	The scientist used an alidade to measure the star’s position.	Noun
Plaza	/ˈplɑːzə/ ˈplɑzə; ˈplæzə	A public square or open space in a city or town.	Spanish	The kids played near the fountain in the plaza.	Noun
Alligator	ˈælɪˌɡeɪtə /ˈælɪɡeɪtər/	A large reptile with a broad snout, native to the Americas.	Spanish	We saw an alligator sunbathing near the swamp.	Noun
Cafeteria	ˌkæfɪˈtɪərɪə /ˌkæfəˈtɪəriə/	A self-service restaurant or dining area, especially in schools or offices.	American Spanish 	We ate lunch in the school cafeteria.	Noun
Alpaca alpacca 	/ælˈpækə/	A domesticated South American mammal valued for its wool.	Spanish	Her scarf was made of soft alpaca wool.	Noun
Macho	/ˈmætʃəʊ/ ˈmɑːtʃou	Displaying strong or exaggerated masculinity.	Spanish	He acted macho to impress his friends.	Adjective
Bongo	/ˈbɒŋɡəʊ/ bɑŋgoʊ; ˈbɔŋgoʊ	A small drum played with the fingers.	West African via Spanish or Portuguese	He tapped a lively rhythm on the bongo drums.	Noun
Amarillo	/ˌæməˈrɪləʊ/ ˌæməˈrɪloʊ	A city in Texas; also means “yellow” in Spanish.	Spanish 	Amarillo is known for its wide-open spaces and cattle ranches.	Noun
Florida	/ˈflɒrɪdə/ /ˈflɔːrɪdə/ ˈflɔrədə; ˈflɑrədə	A southeastern U.S. state known for sunshine and beaches.	Spanish 	Florida has warm weather all year round.	Noun 
Amigo	æˈmiːɡəʊ /əˈmiːɡəʊ/ əˈmigoʊ	A friend (especially in Spanish-speaking contexts).	Spanish	He greeted me with a smile and said, “Hola, amigo!”	Noun
Platinum	/ˈplætɪnəm/ ˈplætənəm	A valuable silver-white metal used in jewellery and industry.	Spanish 	She wore a platinum ring on her finger.	Noun
Amole	ˈæməʊl /əˈmoʊleɪ/	A plant whose roots are used as natural soap.	Spanish, 	Indigenous people used amole roots to make soap for washing.	Noun
Barranca	/bəˈræŋkə/	A deep ravine or gorge.	Spanish	The hiker almost slipped into a steep barranca.	Noun
Chocolate	/ ˈtʃɒkəlɪt ˈtʃɒklɪt /ˈtʃɑːklət/ ˈtʃɔkəlɪt	A sweet food made from roasted cacao beans.	Spanish 	She had a cup of hot chocolate after playing in the snow.	Noun
Flamingo	/fləˈmɪŋɡəʊ/	A tall wading bird with pink feathers and long legs.	Spanish influenced by Portuguese	The flamingo stood on one leg in the pond.	Noun
Chorizo	/tʃəˈriːzəʊ/ tʃoʊˈrizoʊ; tʃoʊˈrisoʊ; tʃəˈrizoʊ; tʃəˈrisoʊ	A spicy Spanish sausage made from pork.	Spanish	He sliced some chorizo to add to the pizza.	Noun
Flamenco	/fləˈmeŋkəʊ/ fləˈmɛŋkoʊ; fləˈmɛnkoʊ	A traditional Spanish dance with clapping and guitar music.	Spanish	She danced flamenco with passion and energy.	Noun
Altiplano	/ˌæltɪˈplɑnoʊ; ˌ ɑltɪˈplɑnoʊ ˌæltɪˈplɑːnəʊ/	A high plateau, especially in the Andes Mountains.	Spanish	The villagers live on the cold and windy altiplano.	Noun
Crimson	/ˈkrɪmzən/ ˈkrɪmsən	A rich deep red colour.	Spanish  	The sky turned crimson as the sun set.	Noun
Tornado	tɔːˈneɪdəʊ tɔrˈneɪdoʊ	A violent rotating column of air extending from a storm to the ground.	Spanish 	The tornado damaged many homes in the village.	Noun
Crusade	/kruːˈseɪd/	A vigorous campaign for a cause or against something.	Spanish, Latin 	She joined the crusade to protect the environment.	Noun
Bonanza	/bəˈnænzə/ boʊˈnænzə	A situation that creates sudden wealth or good fortune.	Spanish	The new store turned out to be a bonanza for the neighbourhood.	Noun
Mulatto	/mjuːˈlætəʊ/ məˈlætou	A dated and now often offensive term for a person of mixed white and Black ancestry.	Spanish 	The term mulatto is now rarely used due to its offensive history.	Noun
Bonito	/bəˈniːtəʊ/ boʊˈnitoʊ; bəˈnitoʊ	A type of fish related to the tuna.	Spanish	The fisherman caught a large bonito near the coast.	Noun
Calaboose	/ˈkæləbuːs/	Informal word for jail or prison.	Spanish 	The sheriff locked the thief in the calaboose.	Noun
Filibuster	/ ˈfɪlɪˌbʌstə ˈfɪləˌbʌstər	A long speech that delays a vote in a legislative assembly.	Spanish 	The senator began a filibuster to block the new law.	Noun
California	/ˌkælɪˈfɔːniə/	A state on the west coast of the USA.	Spanish name 	California is known for its beaches and mountains.	Noun 
Playa	/ˈplaɪə/ ˈplɑːjə 	A dry lake bed or beach (in Spanish-speaking regions).	Spanish 	They walked across the wide playa in the desert.	Noun
Ballet	/ˈbæleɪ/ 	A classical dance form with graceful movements and a story.	French, from Italian 	We went to watch a ballet about a sleeping princess.	Noun
Fiesta	/fiˈestə/ fiˈɛstə	A celebration or festival.	Spanish	We were invited to a colourful fiesta in the village.	Noun
Sapodilla	/ˌsæpəˈdɪlə/	A tropical fruit with sweet, brown flesh.	Spanish 	I tried a sapodilla for the first time and loved it.	Noun
Flotilla	fləˈtɪlə floʊˈtɪlə	A small fleet of ships.	Spanish 	The navy sent a flotilla to patrol the coastline.	Noun
Salsa	/ˈsælsə/ ˈsɑlsə	A spicy sauce or a type of Latin American dance.	Spanish, 	He dipped the chips in tomato salsa.	Noun
Tortilla	/tɔːˈtiːə/ tɔrˈtiə	A thin round bread made from maize or wheat.	Spanish	She wrapped the beans in a warm tortilla.	Noun
Accelerando	/əkˌsɛləˈrændəʊ/ ɑˌtʃɛləˈrɑnˌdoʊ /	A musical direction meaning to play faster.	Italian	The orchestra began to play accelerando to build excitement.	Adverb
Tuna	ˈtjuːnə /ˈtuːnə/ ˈtunə; ˈtjunə	A large sea fish that is commonly eaten.	Spanish via Arabic and Greek 	Tuna sandwiches are popular for lunch.	Noun
Vamoose	/vəˈmuːs/ væˈmuːs	To leave quickly (informal).	From Spanish 	We’d better vamoose before it starts to rain.	Verb 
Tobacco	/təˈbækəʊ/ təˈbækoʊ	A plant whose leaves are dried and used for smoking.	Spanish 	Tobacco was once used as medicine by early tribes.	Noun
Adularia	/ˌædjʊˈlɛəriə/ /ˌædʒəˈlɛəriə/ ˌædʒuˈlɛriə; 	A transparent or translucent mineral of the feldspar group.	Eponym 	The geologist found a shiny crystal of adularia in the rock.	Noun
Ballot	/ˈbælət/	A process of voting, especially in secret.	Italian 	The students used a ballot to choose their class president.	Noun
Tomatillo	 ˌtɒməˈtɪləʊ ˌtoʊməˈtioʊ ˈˌtoʊmətiːjəʊ	A small green fruit enclosed in a husk, used in Mexican cooking.	Spanish 	She made green salsa with tomatillos.	Noun
Vanilla 	/vəˈnɪlə/	A substance obtained from vanilla pods, used to give flavour to sweet foods.	Spanish 	She added vanilla to the cake to make it smell sweet.	Noun
Adagio	/əˈdɑːdʒɪəʊ/ /əˈdɑːdʒioʊ/ əˈdɑːdʒɪˌəʊ əˈdɑʒoʊ;	A musical term meaning ‘slowly’.	Italian	The ballerina danced gracefully to the adagio part of the music.	Noun
Bergamot	ˈbɜːɡəˌmɒt ˈbɜrgəˌmɑt	A type of orange whose oil is used in perfume and tea flavouring.	Italian from Turkish 	The tea had a lovely bergamot scent.	Noun
Agitato	/ˌædʒɪˈtɑːtəʊ/ /ˌædʒɪˈtɑːtoʊ/	A musical term instructing the performer to play in an agitated manner.	Italian	The music was marked agitato to show a sense of urgency.	Adverb
Malaria	 məˈlɛərɪə məˈlɛriə 	A serious disease spread by mosquitoes in hot countries.	Italian 	They used nets to protect themselves from malaria at night.	Noun
Arsenal	ˈɑːsənəl ˈɑːrsənl, ˈɑːrsnəl /ˈɑːrsənəl/	A place where weapons and military equipment are stored or made.	Italian from Arabic 	The soldiers trained near the old arsenal by the river.	Noun
Belladonna	 ˌbɛləˈdɒnə 	A poisonous plant with purple flowers and black berries; also known as deadly nightshade.	Italian 	The scientist studied the effects of belladonna in small doses.	Noun
Artichoke	ˈɑːtɪˌtʃəʊk ˈɑrtəˌtʃoʊk / ˈɑːrtɪˌtʃouk	A vegetable with a round head of thick leaves and a soft heart.	Italian from Arabic 	She had never tried an artichoke before, but she liked the taste.	Noun
Bandit	/ˈbændɪt/	A robber, especially one who travels with others in a group.	Italian 	The sheriff chased the bandit across the desert.	Noun
Artisan	 ˈɑːtɪˌzæn , ˌɑːtɪˈzæn	A worker skilled in a craft, especially one that involves making things by hand.	French from Latin 	The artisan made beautiful handmade pottery.	Noun
Ballerina	/ˌbæləˈriːnə/	A female ballet dancer.	Italian 	The ballerina twirled across the stage in a pink tutu.	Noun
Manifesto	ˌmænɪˈfɛstəʊ  ˌmænəˈfɛstoʊ	A public written statement of beliefs or aims, especially by a political group.	from Latin 	The candidate shared her manifesto with the voters.	Noun
Decubitus	/dɪˈkjuːbɪtəs/	The position assumed in lying down; often refers to pressure ulcers (bedsores) from prolonged lying.	Latin 	Patients in hospitals are turned often to prevent decubitus ulcers.	Noun
Exonumia	ˌɛksəʊˈnjuːmɪə , ˌɛksəʊˈnuːmɪə ˌeksəˈnuːmiə, -ˈˌeksənjuːmiə-	Tokens, medals, or other coin-like items not used as legal currency.	Latin 	She collected exonumia like arcade tokens and old subway coins.	Noun 
Factotum	/fækˈtəʊtəm/ /fækˈtoʊtəm/	A person having many diverse activities or responsibilities.	Latin 	Mr. James was the school’s factotum—he fixed things, taught classes, and more.	Noun
Dedendum	 dɪˈdendəm	The portion of a gear tooth that lies below the pitch circle.	Latin 	The engineer explained how the dedendum affects the gear’s rotation.	Noun
Florilegium	 ˌflɔːrɪˈliːdʒɪəm ˌflɔrəˈlidʒiəm; ˌ floʊrəˈlidʒiəm	A collection of literary extracts; an anthology.	Latin 	The poet published a florilegium of his favourite verses.	Noun
Graveolent	/ˈɡræviələnt/	Having a strong, unpleasant smell.	Latin 	The graveolent smell from the bin made everyone leave the room.	Adjective
Defenestration	diˌfɛnəˈstreɪʃən diˌfenəˈstreiʃən	The act of throwing someone or something out of a window.	Latin 	The book described a famous defenestration in history.	Noun
Flammulated	/ˈflæmjʊleɪtɪd/	Marked with flame-like patterns or having a reddish tint, as in the flammulated owl.	Latin 	The flammulated owl is hard to see because of its feather colours.	Adjective
Obsignation	/ˌɒbsɪɡˈneɪʃən/	The act of sealing or confirming by a seal.	Latin 	The ancient document showed marks of royal obsignation.	Noun
Demodulation	/ˌdiːmɒdjʊˈleɪʃən/ diˌmɑdʒəˈleiʃən	The process of extracting the original information from a modulated carrier wave.	Latin 	Radios work by demodulation to let us hear voices from far away.	Noun
Fauces	/ˈfɔːsiːz/ 	The opening at the back of the mouth leading to the throat; also used in anatomy and architecture.	Latin 	The doctor used a light to look into the boy’s fauces.	Noun (plural)
Obstipation	 ˌɒbstɪˈpeɪʃən ˌɑbstəˈpeɪʃən	Severe or complete constipation.	Latin 	The patient suffered from obstipation and needed medical help.	Noun
Desiderium	/ˌdɛsɪˈdɪəriəm/ ˌdesɪˈdɪəriəm	An ardent longing or grief for something lost.	Latin 	His eyes showed a deep desiderium for the places he once called home.	Noun
Excursus	/ɪkˈskɜːsəs/ /ɪkˈskɜːrsəs/	A detailed discussion in a book that is separate from the main topic.	Latin 	The textbook had an excursus about ancient Roman festivals.	Noun
Oecus	 ˈikəs	The principal hall or reception room in a Roman house.	Latin, from Greek 	The mosaic floor in the oecus was beautifully decorated.	Noun
Domatium	 dɒˈmeɪʃɪəm 	A small chamber produced by a plant, usually to house insects that benefit the plant.	Latin 	The ant colony lived inside the plant’s domatium.	Noun
Excelsior	/ɪkˈsɛlsiɔː/ ɪkˈsɛlsɪˌɔː ɛkˈsɛlsiˌɔr; ɪkˈsɛlsiər , ɛkˈsɛlsiər;	Ever upward (motto); also a packing material made of curled wood shavings.	Latin 	Their school motto was Excelsior, meaning they always aim higher.	Adjective/Noun
Omnium	/ɒmnɪəm  	A mixture or collection of all kinds; in cycling, a multi-event race.	Latin 	The cyclist won the omnium by excelling in every event.	Noun
Duodecimo	/ˌdjuːəʊˈdɛsɪməʊ/  ˌduːəˈdesəˌmou	A book size resulting from folding a sheet of paper into twelve leaves (24 pages).	Latin 	He collected rare duodecimo books from the 18th century.	Noun
Ebriosity	ˌiːbrɪˈɒsɪtɪ 	Habitual drunkenness.	Latin 	The novel warned of the dangers of ebriosity.	Noun
Materfamilias	ˌmeɪtəfəˈmɪlɪˌæs ˈmeɪtərfəˈmɪliəs; ˈmɑtərfəˈmɪliəs)	The female head of a household.	Latin 	The materfamilias made all important decisions in the home.	Noun
Encaenia	ɛnˈsiniə; ɛnˈsinjə	A ceremony commemorating the foundation of a building or institution; at Oxford, a graduation celebration.	Greek 	The students dressed in gowns for the Encaenia ceremony.	Noun
Modiolus	/ məʊˈdaɪəʊləs moʊˈdaɪələs məˈdaɪələs	A central structure in the cochlea of the ear; also, a small cylindrical architectural element.	Latin 	The scientist explained how the modiolus helps in hearing.	Noun
Lararium	/ləˈrɛəriəm/	A shrine to household gods in a Roman home.	Latin 	The family placed offerings in the lararium each morning.	Noun
Erysipelas	 ˌɛrɪˈsɪpɪləs ˌɛrɪˈsɪpələs; ˌ ɪrəˈsɪpələs	A bacterial skin infection causing red, inflamed patches.	Greek 	The doctor explained that erysipelas needed antibiotics.	Noun
Hebdomadal	/hɛbˈdɒmədəl/ hebˈdɑmədl/	Occurring weekly.	Greek 	The school holds hebdomadal meetings every Monday.	Adjective
Orientalia	 ˌɔriɛnˈteɪliə; ˌ oʊriɛnˈteɪliə	Objects or writings from or about the East (Asia or the Middle East).	Latin 	The museum’s exhibit featured rare Orientalia from ancient China.	Noun 
Escharotic	 ˌɛskəˈrɒtɪk ˌeskəˈrɑtɪk	Causing the formation of a scab (eschar) by destroying tissue; a caustic agent.	Greek 	Some ancient treatments used escharotic substances to heal wounds.	Noun
Opodeldoc	 ˌɒpəˈdɛldɒk 	A soft medicinal plaster or liniment used in older times.	Latin	Grandmother rubbed opodeldoc on her sore knees.	Noun
Nosocomial	ˌnɒsəˈkəʊmɪəl ˌnoʊsəˈkoʊmiəl ˌnɑsəˈkoumiəl	Acquired in a hospital (usually refers to infections).	Greek 	The doctor explained the risk of nosocomial infections during long stays.	Adjective
Mactation	/mækˈteɪʃən/	The act of killing a sacrificial victim.	Latin 	Ancient tribes performed mactation in their religious ceremonies.	Noun
Haematin/Hematin	/ˈhiːmətɪn/ ˈhɛmətɪn 	A brownish pigment derived from hemoglobin, used in stains or studies of blood.	Greek 	The researcher used hematin to study the blood cells under the microscope.	Noun
Paternoster	/ ˌpætəˈnɒstə /ˈpɑːtərˌnɑːstər/ ˈpætərˈnɑstər	The “Our Father” prayer in Latin; also, a type of lift that moves continuously.	Latin 	The old library still used a paternoster lift with no doors.	Noun
Hypostasis	/haɪˈpɒstəsɪs/ /haɪˈpɑːstəsɪs/	The essence or underlying reality; also a settling of blood after death.	Greek 	The philosopher debated the hypostasis of the soul.	Noun
Quartan	/ˈkwɔːtən  / /ˈkwɔrtən	Occurring every fourth day, especially a type of fever (e.g. malaria).	Latin 	The explorer described his struggle with quartan fever in the jungle.	Adjective
Penetralia	/ˌpɛnɪˈtreɪlɪə/ ˌpenɪˈtreiliə	The innermost or most secret parts, especially of a building or institution.	Latin 	Only a few people were allowed into the temple’s penetralia.	Noun 
Quasimodo	ˌkwɔːzɪˈməʊdəʊ ˌkwɑːsəˈmoudou, ˌkwɑːzəˈmoudou	A name given to the first Sunday after Easter; also the name of a hunchbacked bell-ringer in Hugo’s novel.	Latin 	Quasimodo rang the bells with all his heart.	Noun
Radiesthesia	/ˌreɪdiɪsˈθiːziə/ ˌreɪdɪəsˈθiːzɪə , ˌreɪdɪəsˈθiːʒə	A supposed sensitivity to radiation or energies, used in dowsing or detecting objects.	Latin 	She claimed to use radiesthesia to find underground water.	Noun
Sanatorium sanitarium 	/ˌsænəˈtɔːriəm/  ˌsænɪˈtɛərɪəm	A medical facility for long-term illness, especially tuberculosis.	Latin 	The sick child was sent to a mountain sanatorium to recover.	Noun
Plaudite	/ ˈplɔːdɪtɪ 	Latin for "applaud"; used historically to end Roman plays, inviting the audience to clap.	Latin 	The play ended with a loud "Plaudite!" written on a scroll.	Interjection
Saturnalia	/ˌsætəˈneɪliə/ ˌsætərˈneɪliə; ˌsætərˈneɪljə	An ancient Roman festival with feasting and revelry; a time of unrestrained celebration.	Latin 	The holiday was a true Saturnalia, full of food and fun.	Noun 
Promptuary	/ ˈprɒmptʃʊərɪ 	A storehouse or repository of things or information.	Latin 	The ancient library was a promptuary of knowledge for the town.	Noun
Saxicavous	 sækˈsɪkəvəs 	Rock-boring or rock-dwelling (esp. of marine animals or birds).	Latin 	The saxicavous birds built nests in the cliffside.	Adjective
Puerile	/ˈpjʊə.raɪl/ /ˈpjʊrəl/ ˈpjuərəl; ˈpjʊrəl	Childishly silly or trivial.	Latin 	His puerile jokes made the whole class roll their eyes.	Adjective
Sententia	/sɛnˈtɛnʃə/	A wise saying or maxim.	Latin 	“To err is human” is a classic sententia.	Noun
Transpontine	/trænzˈpɒntaɪn/ /trænsˈpɑːntaɪn/ trænsˈpɑntɪn	Situated on or relating to the far side of a bridge; also used theatrically to describe melodramatic plays (once staged across the Thames).	Latin 	The old theatre was known for its transpontine dramas.	Adjective
Uliginous	/juːˈlɪdʒɪnəs/ juːˈlɪdʒənəs	Slimy, swampy, or growing in wet, marshy areas.	Latin 	Frogs croaked in the uliginous bog all night.	Adjective
Solipsism	ˈsɒlɪpˌsɪzəm 	The philosophical idea that only one’s own mind is sure to exist.	Latin 	The thinker’s extreme solipsism made him question if others were real.	Noun
Trabecula	/trəˈbɛkjʊlə/ trəˈbɛkjulə	A small bar, rod, or supporting structure, especially in biological tissues like bone.	Latin 	The doctor showed how a trabecula supports the spongy part of the bone.	Noun
Ululate	/ ˈjuːljʊˌleɪt /ˈʌljəˌleɪt/	To howl or wail, especially as an expression of grief or strong emotion.	Latin 	The wolves began to ululate under the full moon.	Verb
Stereobate	/ˈstɛriəʊˌbeɪt/ ˈstɪərɪəʊˌbeɪt	The solid foundation or substructure on which a classical building rests.	Greek 	The archaeologists discovered the stereobate of a lost temple.	Noun
Theriacal	 ˌθɪərˈaɪəkəl	Related to or resembling a cure-all; made from theriac, a historical medicinal compound.	Greek 	The monk used a theriacal paste to treat many illnesses.	Adjective
Umbratile	/ˈʌmbrətaɪl/	Living in or suited to the shade; reclusive or studious in nature.	Latin 	The umbratile scholar preferred libraries over loud crowds.	Adjective
Subaudition	/ˌsʌbɔːˈdɪʃən/ ˌsʌbɔˈdɪʃən	The implied or unspoken part of an utterance that is mentally understood.	Latin 	“Can you pass the salt?” includes a subaudition of “please.”	Noun
Sudarium	sʊˈdɛərɪəm  suːˈdɛəriəm	A cloth for wiping sweat; also, a relic associated with Christ’s burial.	Latin 	The cathedral displayed a replica of the sacred sudarium.	Noun
Supererogation	/ˌsuːpərɛrəˈɡeɪʃən/	Doing more than duty requires, especially in a moral or religious sense.	Latin 	Donating to charity is an act of supererogation, not obligation.	Noun
Tepidarium	 ˌtɛpɪˈdɛərɪəm 	A warm bath or warm room in a Roman bathhouse.	Latin	The Roman family relaxed in the tepidarium before moving to the hot room.	Noun
Ustulation	 ˌʌstjʊˈleɪʃən 	The process of burning or roasting, especially in chemistry or alchemy.	Latin 	The alchemist began the ustulation of the powder over an open flame.	Noun
Supernaculum	/ˌsuːpəˈnækjʊləm/	Excellent beyond compare (originally referring to fine wine drunk to the last drop).	Latin 	His performance was supernaculum—better than anyone expected.	Noun
Tabellion	 təˈbɛljən 	A Roman public notary or scribe.	Latin 	The tabellion recorded the agreement in official handwriting.	Noun
Vexillation	/ˌvɛksɪˈleɪʃən/	A detachment of a Roman legion; also used for a standard-bearing military unit.	Latin 	The vexillation marched with their banner held high.	Noun
Foederatus	/ˌfɛdəˈreɪtəs/ 	An allied tribe or state, especially one allied with ancient Rome under a treaty.	Latin 	The foederatus provided troops in exchange for Roman protection.	Noun
Geosyncline	 ˌdʒioʊˈsɪnˌklaɪn ˌdʒiːəʊˈsɪŋklaɪn 	A large-scale depression in Earth’s crust containing thick sedimentary deposits.	Greek 	The mountain range formed along the ancient geosyncline.	Noun
Auscultation	/ˌɔːskəlˈteɪʃən/ ˌɔskəlˈteɪʃən	Listening to sounds within the body, usually with a stethoscope, to diagnose illness.	Latin 	The doctor performed auscultation to check the patient’s lungs.	Noun
Bilharziasis	ˌbɪlhɑrˈzaɪəsɪs 	A tropical disease caused by parasitic flatworms, also called schistosomiasis.	Latin 	People in the village were treated for bilharziasis after swimming in the river.	Noun
Gyromancy	/ˈdʒaɪrəˌmænsi/	A form of divination by walking or spinning in a circle until dizzy, then interpreting where one falls.	Greek 	In ancient times, gyromancy was performed to answer spiritual questions.	Noun
Catilinarian	 ˌkætləˈnɛəriən	Relating to or resembling the conspiratorial and revolutionary actions of Catiline, a Roman senator.	Latin 	His catilinarian speech called for rebellion against the leaders.	Adjective
Byssinosis	/ˌbɪsɪˈnəʊsɪs/ /ˌbɪsəˈnoʊsɪs/	A lung disease caused by inhaling cotton dust, common among textile workers.	Greek 	The factory worker developed byssinosis after years in the mill.	Noun
Guttatim	 ɡəˈteitəm, ɡəˈˌtɑːtəm	Drop by drop.	Latin 	The medicine was administered guttatim into the patient’s eye.	Adverb
Colloquium	/kəˈləʊkwiəm/ /kəˈloʊkwiəm/ 	A formal academic meeting or seminar for discussion.	Latin 	We attended a science colloquium on climate change.	Noun
Iontophoresis	aɪˌɒntəʊfəˈriːsɪs aiˌɑntəfəˈrisɪs	A medical technique using a small electric current to deliver medicine through the skin.	Greek 	Iontophoresis helped the athlete recover by delivering anti-inflammatory drugs.	Noun
Gynecomastia	ˌgaɪnəkoʊˈmæstiə ˌdʒɪnɪkouˈmæstiə ɡainɪkoʊˈmæstiə-, ˌ dʒainɪkoʊˈmæstiə	Abnormal enlargement of male breast tissue.	Greek 	The teenager developed mild gynecomastia during puberty.	Noun
Labefaction	/ˌlæbɪˈfækʃən/ ˌlæbəˈfækʃən	The act of weakening or undermining; a state of collapse or ruin.	Latin 	The labefaction of the ancient bridge made it unsafe to cross.	Noun
Collunarium	 ˌkɑljəˈnɛəriəm	A medicinal preparation for the nose, often in liquid or ointment form.	Latin 	The ancient remedy included a collunarium for nasal relief.	Noun
Graphomania	ˌɡræfəʊˈmeɪnɪə 	An obsessive impulse to write, often excessively and without purpose.	Greek 	The author’s graphomania led to hundreds of notebooks filled with ramblings.	Noun
Haecceity	hɛkˈsiːɪtɪ hiːksiːɪtɪ hɛkˈsiəti	The discrete qualities or essence that make something uniquely itself; "thisness."	Medieval Latin 	The haecceity of the old book made it priceless to collectors.	Noun
Imprimatur	/ˌɪmprɪˈmeɪtər/ /ˌɪmprɪˈmɑːtər/ ˌɪmprɪˈmeɪtə  	An official license to publish; figuratively, any formal approval.	Latin 	The teacher gave her imprimatur to the club’s new project.	Noun
Gnotobiotic	/ˌnəʊtəʊbaɪˈɒtɪk/ ˌnoutoubaiˈɑtɪk	Referring to organisms or environments where all microorganisms are known or controlled.	Greek 	Gnotobiotic mice are used in laboratory experiments to study gut bacteria.	Adjective
Columbarium	/ˌkɒləmˈbɛəriəm/ 	A building or space with niches for storing funeral urns containing cremated remains.	Latin 	The family placed the ashes in a columbarium at the cemetery.	Noun
Interpellate	ɪnˈtɜːpɛˌleɪt ˌɪntərˈpɛlˌeɪt; ɪnˈtɜrpəˌleɪt	To formally question or interrupt a speaker, especially in parliament or debate.	Latin 	The member of parliament rose to interpellate the minister on climate policy.	Verb
Glyptography	/ɡlɪpˈtɒɡrəfi/	The art or process of carving on gems or stones.	Greek 	Ancient glyptography is preserved in museum seal stones.	Noun
Lectisternium	/ˌlɛktɪˈstɜːniəm/	A Roman religious feast where images of gods were laid on couches and offered meals.	Latin 	The priests held a lectisternium to honor Jupiter and Juno.	Noun
Commissure	 ˈkɒmɪˌsjʊə ˈkɑməˌʃʊr	A connecting band of nerve tissue or structure that joins parts of the body, especially in the brain.	Latin 	The doctor explained how the corpus callosum is a major brain commissure.	Noun
Glottogonic	/ˌɡlɒtəˈɡɒnɪk/	Relating to the origin or evolution of language.	Greek 	Glottogonic theories explore how languages first developed among humans.	Adjective
Bulbiferous	bʌlˈbɪfərəs	Producing or bearing bulbs, especially in plants.	Latin 	The bulbiferous plant sprouted tiny bulbs along its leaves.	Adjective
Instauration	/ˌɪnstɔːˈreɪʃən/ ˌɪnstɔˈreɪʃən	Restoration or renewal; the act of establishing something again.	Latin 	The instauration of the old library delighted the whole town.	Noun
Concupiscence	kənˈkjuːpɪsəns kɑnˈkjuːpɪsəns, kɑŋˈkjuːpɪsəns 	Strong sexual desire; lust. (Also used more broadly in theological contexts as human longing for sinful things.)	Latin 	Some old stories describe heroes falling due to their concupiscence.	Noun
Ginglymus	ˈdʒɪŋɡlɪməs ˈdʒɪŋɡləməs, ˈɡɪŋɡləməs	A hinge joint allowing motion in one plane, like the elbow.	Greek 	The elbow is a classic example of a ginglymus joint.	Noun
Nullipore	 ˈnʌlɪˌpɔː ˈnʌləˌpɔr	A type of red algae with a stony, coral-like appearance, often found in marine environments.	Latin 	Scientists discovered a patch of nullipore near the coral reef.	Noun
Pectoriloquy	/ˌpɛktəˈrɪləkwɪ/	The sound of a person’s voice being unusually clear when heard through a stethoscope, indicating a cavity in the lungs.	Latin	The physician identified pectoriloquy, suggesting lung damage.	Noun
Cryptosporidiosis	/ˌkrɪptoʊˌspɔːrɪ diˈoʊsɪs/ ˌkrɪptoʊ spour diˈoʊsɪs	A diarrheal disease caused by microscopic parasites in contaminated water.	Greek 	The campers were warned about cryptosporidiosis from drinking stream water.	Noun
Cucullate	 kjuˈkʌlˌeɪt; kjuˈkʌlɪt; ˈkjukəˌleɪt; kjuˈkəlɪt	Having a hood-like shape, especially in plants or anatomy.	Latin 	The orchid’s cucullate petal looked like a tiny hood.	Adjective
Dionysian	/ˌdaɪəˈnɪziən/  ˌdaɪəˈnɪʃən; ˌdaɪəˈnɪsiən; ˌdaɪəˈnɪziən	Wild, frenzied, or relating to Dionysus, the Greek god of wine and festivity.	Greek	The dancers moved with Dionysian energy during the celebration.	Adjective
Extraforaneous	/ˌɛkstrəfəˈreɪniəs/	Outside a forum or courtroom; external to formal judicial proceedings.	Latin 	The matter was handled in an extraforaneous setting, not in court.	Adjective
Intercolline	 ˌɪntəˈkɒlaɪn 	Situated between hills or mountain ridges.	Latin 	A mist settled in the intercolline valley just before dawn.	Adjective
Leishmaniasis	/ˌliːʃməˈnaɪəsɪs/ ˌliʃməˈnaɪəsɪs ˌlaiʃməˈnaiəsɪs,  	A tropical disease caused by Leishmania parasites, spread by sandflies.	An eponym	Doctors treated villagers for leishmaniasis after an outbreak.	Noun
Mydriasis	/ˌmɪˈdraɪəsɪs/ maɪˈdraɪəsɪs 	Dilation of the pupils, usually due to drugs, disease, or trauma.	Greek 	The doctor noted mydriasis as a sign of neurological distress.	Noun
Nasturtium	  nəˈstɜːʃəm nəˈstɜrʃəm; næˈstɜrʃəm	A plant of the cress family with peppery-tasting leaves and bright flowers.	Latin 	She decorated the salad with nasturtium leaves and flowers.	Noun
Perityphlitis	ˌpɛrɪtɪfˈlaɪtɪs 	Inflammation of tissues around the cecum, similar to or associated with appendicitis.	Greek 	The patient was diagnosed with perityphlitis after severe abdominal pain.	Noun
Sphagnicolous	/sfæɡˈnɪkələs/	Living or growing in sphagnum moss.	Latin 	Sphagnicolous insects thrive in the moist environment of bogs.	Adjective
Tachyphylaxis	ˌtækəfɪˈlæksɪs	A rapidly decreasing response to a drug after repeated doses.	Greek	The doctor adjusted the dosage due to the patient’s tachyphylaxis.	Noun
Philosophaster	/ fɪˌlɒsəˈfæstə , fɪˈlɒsəˌfæstə fɪˌlɑsəˈfæstər, fɪˈlɑsəˌfæstər	A pretender to knowledge or philosophy; a sham philosopher.	Latin 	The play mocked a philosophaster who misled students with nonsense.	Noun
Somnambulist	/sɒmˈnæmbjʊlɪst/ 	A person who walks in their sleep; a sleepwalker.	Latin 	The somnambulist was found walking in the hallway with his eyes closed.	Noun
Teetotum	/tiːˈtəʊtəm/ /tiːˈtoʊtəm/ 	A spinning top with letters on its sides used in games of chance.	Latin 	The children played with a teetotum during the festival.	Noun
Geitonogamy	ˌɡaɪtəˈnɒɡəmɪ ˌɡaitnˈɑɡəmi	Transfer of pollen from one flower to another on the same plant.	Greek 	Geitonogamy often leads to reduced genetic diversity in self-pollinating plants.	Noun
Pinocytosis	ˌpaɪnəʊsaɪˈtəʊsɪs ˌpɪnəsaiˈtousɪs, ˌpainəsaiˈtousɪs	A form of endocytosis in which cells engulf liquid into vesicles.	Greek	Pinocytosis helps cells absorb nutrients by taking in tiny fluid droplets.	Noun
Siphuncle	/ˈsaɪfʌŋkəl/	A tube-like structure in cephalopods that connects the chambers of their shell and helps control buoyancy.	Latin 	The fossil showed a well-preserved siphuncle running through the shell.	Noun
Trophaeum	/trəˈfiːəm/ /troʊˈfiːəm/ 	A classical monument commemorating victory, similar to a trophy.	Latin, from Greek	The general erected a trophaeum to mark the triumph over the invaders.	Noun
Planuliform	pləˈnjuːlɪˌfɔːm 	Shaped like a planula, the flattened larval form of certain coelenterates like jellyfish.	Latin 	The creature’s planuliform body helped it glide through the water.	Adjective
Quaestionary Questionary	 ˈkwiːstʃənərɪ 	Pertaining to interrogation or inquisition; a collection of questions.	Latin 	The detective used a quaestionary approach to gather detailed statements.	Adjective
Geosynchronous	/ˌdʒiːəʊˈsɪŋkrənəs	Describing an orbit where a satellite stays above the same point on Earth's surface.	Greek 	The weather satellite was placed in a geosynchronous orbit.	Adjective
Saeculum	 ˈsaɪkjʊləm 	An age or era in Roman reckoning, often the time from a person's birth to their death.	Latin 	The temple was built to last through many saecula of worship.	Noun
Probabiliorism	ˌprɒbəˈbɪlɪəˌrɪzəm 	A moral or theological doctrine favoring the more probable of opposing opinions.	Latin 	The priest followed probabiliorism when faced with an ethical dilemma.	Noun
Shigellosis	/ʃɪɡəˈləʊsɪs/ ˌʃɪɡəˈləʊsɪs 	An infectious disease caused by Shigella bacteria, marked by diarrhoea and fever.	Eponym	The outbreak of shigellosis led to a quarantine in the village.	Noun
Gametogenesis	/ˌɡæmɪtəʊˈdʒɛnɪsɪs/ gəˌmitoʊˈdʒɛnəsɪs ɡəˌmitəˈdʒenəsɪs	The process by which gametes (sperm or eggs) are produced in organisms.	Greek 	Gametogenesis is essential for reproduction in all sexually reproducing species.	Noun
Promuscidate	/prəʊˈmʌskɪdeɪt/	Having a projecting snout or proboscis.	Latin 	The insect’s promuscidate head allowed it to reach deep into flowers.	Adjective
Unnilpentium	 ˌjuːnɪlˈpɛntɪəm ˌjunəlˈpɛntiəm	The temporary systematic name for element 105, now called dubnium.	Greek 	Before its naming, scientists referred to dubnium as unnilpentium.	Noun
Geriatrics	/ˌdʒɛriˈætrɪks/ ˌdʒɪər ætrɪks 	The branch of medicine dealing with the health and care of the elderly.	Greek	She studied geriatrics to work in a nursing home.	Noun
Xenodochium	ˌzɛnəˈdɒkɪəm 	A place for receiving strangers or pilgrims; a guest-house in ancient times.	Greek 	The monks opened a xenodochium for travelers during the holy season.	Noun
Pyrophorous	 paɪˈrɒfərəs 	Capable of igniting spontaneously in air.	Greek 	The pyrophorous substance burst into flame without a match.	Adjective
Quadragesima	ˌkwɒdrəˈdʒɛsɪmə ˌkwɑdrəˈdʒeɪzɪmə; ˌkwɑdrəˈdʒɛsɪmə	The forty-day period of Lent in the Christian calendar.	Latin 	Quadragesima begins on Ash Wednesday and ends before Easter.	Noun
Quaesitum	 kwiːˈsiːtəm 	Something sought after, especially in philosophical or theological inquiry.	Latin 	The philosopher's quaesitum was the meaning of true justice.	Noun
Naumachia	 nɔːˈmeɪkɪə 	An ancient Roman spectacle representing a mock sea battle.	Greek 	The emperor staged a naumachia using thousands of fighters on water.	Noun
Perissodactyl perissodactyle 	pəˌrɪsouˈdæktɪl pəˌrɪsəʊˈdæktɪl pəˌrɪsəˈdæktəl pəˌrɪsəʊˈdæktaɪl	A hoofed mammal with an odd number of toes, such as horses or rhinos.	Greek 	The zebra is a type of perissodactyl with a single toe on each foot.	Noun
Semelparous	 ˈsɛməlˌpærəs 	Reproducing only once in a lifetime, then dying (used in biology).	Latin 	The salmon is a semelparous species that dies after spawning.	Adjective
Trophallaxis	/ˌtrɒf.əˈlæksɪs/	The mutual exchange of regurgitated food between insects like ants or bees.	Greek 	Ants use trophallaxis to share food and chemical signals.	Noun
Unguentarium	ˌʌŋɡwəntˈɛərɪəm 	A small bottle or jar used in ancient times for holding ointments or perfumes.	Latin 	The archaeologist found an unguentarium in the Roman burial site.	Noun
Gastroenterology	ˌɡæstrəʊˌentərəˈlɒdʒi/ /-ˈlɑːdʒi/ ˌɡæstrəʊˌɛntəˈrɒlədʒɪ 	The branch of medicine dealing with the digestive system and its disorders.	Greek 	She plans to specialize in gastroenterology to help children with gut issues.	Noun
Hadrosaur	ˈhædrəˌsɔː ˈhædrəˌsɔr	A member of a group of duck-billed herbivorous dinosaurs.	Greek 	The fossilized skull of a hadrosaur was found in the riverbed.	Noun
`;

const parseWords = (text: string, difficulty: Difficulty): SpellingWord[] => {
  const words: SpellingWord[] = [];
  const lines = text.trim().split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (trimmedLine.startsWith('WORD')) continue; // Skip header
    if (trimmedLine.startsWith('ROUND')) continue; // Skip round headers

    // Split by tab OR 2+ spaces to handle copy-paste formatting issues
    const parts = trimmedLine.split(/\t|\s{2,}/);
    
    if (parts.length < 2) continue;

    const word: SpellingWord = {
      word: parts[0].trim(),
      pronunciation: parts[1]?.trim() || '',
      definition: parts[2]?.trim() || '',
      origin: parts[3]?.trim() || '',
      sentence: parts[4]?.trim() || '',
      partOfSpeech: parts[5]?.trim() || '',
      difficulty: difficulty,
    };
    words.push(word);
  }

  return words;
};

export const wordList: SpellingWord[] = [
  ...parseWords(grade2to4Raw, Difficulty.GRADE_2_4),
  ...parseWords(grade5to9Raw, Difficulty.GRADE_5_9)
];
