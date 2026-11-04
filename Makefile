include .launchpad/Makefile.header # see .launchpad/Makefile.documentation

#-----------------------------------------------------------------------------------------------------------------------
# Compile
#-----------------------------------------------------------------------------------------------------------------------

default : $(LP_PREREQUISITE_BUNDLE)
	node dist/directoroo.mjs resources/example.directoroo \
        --validate-tags=vsc,ahk,cd \
        --validate-paths \
        --expand-environment-variables \
        --filter-tags=vsc  \
        --output-sh=test/cd.sh \
        --output-json=test/directoroo.json \
        --output-vsc-project-manager=test/vsc-project-manager.json

src/generated/shell-script-template.ts : bin/embed-shell-script-template.mjs resources/shell-script-template.sh
	echo Updating $@... && node bin/embed-shell-script-template.mjs resources/shell-script-template.sh $@

#-----------------------------------------------------------------------------------------------------------------------
# Bundle
#-----------------------------------------------------------------------------------------------------------------------

$(call lp.bundle.add, src/directoroo.ts, dist/directoroo.mjs, shebang)

#-----------------------------------------------------------------------------------------------------------------------
# Release
#-----------------------------------------------------------------------------------------------------------------------

release :
	   echo Deleting pre-existing builds... \
	&& rm -rf build dist \
	&& echo Updating the version number... \
	&& bin/update-version-number.sh \
	&& $(MAKE) bundle \
	&& echo Assembling package... \
	&& cp -f README.md dist/README.md \
	&& cp -f resources/cli.mjs dist/cli.mjs \
	&& cp -f resources/package.release.json dist/package.json

unrelease :
	echo Reverting the version number... && git checkout -- src/resources/version-information.ts resources/package.release.json

#-----------------------------------------------------------------------------------------------------------------------
# Publish
#-----------------------------------------------------------------------------------------------------------------------

publish:
	cd dist && npm publish --access public

#-----------------------------------------------------------------------------------------------------------------------
# Clean
#-----------------------------------------------------------------------------------------------------------------------

$(call lp.clean.tsc-output)
$(call lp.clean.files, dist)

AGENTS_MD_INCLUDE=$(PE_AGENTS_MD)/code-style.all.md $(PE_AGENTS_MD)/code-style.js.md $(PE_AGENTS_MD)/code-style.ts.md $(PE_AGENTS_MD)/frameworks.node.md $(PE_AGENTS_MD)/frameworks.typefinity.all.md $(PE_AGENTS_MD)/frameworks.typefinity.cli.md $(PE_AGENTS_MD)/general.md $(PE_AGENTS_MD)/testing.none.md

#-----------------------------------------------------------------------------------------------------------------------
include .launchpad/Makefile.footer
