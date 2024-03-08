FILENAME += m2
BIB += m2

pdf: 
	@pandoc --standalone \
			--metadata-file=metadata.yaml \
			--quiet \
			-s -o $(FILENAME).pdf $(FILENAME).md \
			-V colorlinks=true \
			-V linkcolor=blue  \
			-V urlcolor=blue  \
			-V fontsize=12pt \
			-V toccolor=gray \
			--bibliography=$(BIB).bib --citeproc \
			-M reference-section-title="References"
	@echo "PDF generated successfully"
